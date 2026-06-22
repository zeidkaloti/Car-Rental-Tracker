"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { rentals, cars } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { rentalInputSchema, type RentalInput } from "@/lib/validation/rental";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// cars.status is a denormalized convenience column — this is the only place
// that's allowed to write it. Source of truth is always "does this car have
// an active rental row".
async function syncCarStatus(tx: typeof db | Transaction, carId: string) {
  const activeRental = await tx.query.rentals.findFirst({
    where: and(eq(rentals.carId, carId), eq(rentals.status, "active")),
  });

  const car = await tx.query.cars.findFirst({ where: eq(cars.id, carId) });
  if (!car) return;

  if (activeRental) {
    if (car.status !== "rented") {
      await tx.update(cars).set({ status: "rented" }).where(eq(cars.id, carId));
    }
  } else if (car.status === "rented") {
    await tx.update(cars).set({ status: "available" }).where(eq(cars.id, carId));
  }
}

export async function createRental(
  input: RentalInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = rentalInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const rentalId = await db.transaction(async (tx) => {
      if (parsed.data.status === "active") {
        const existingActive = await tx.query.rentals.findFirst({
          where: and(eq(rentals.carId, parsed.data.carId), eq(rentals.status, "active")),
        });
        if (existingActive) {
          throw new Error("This car already has an active rental.");
        }
      }

      const [rental] = await tx
        .insert(rentals)
        .values({
          ...parsed.data,
          rateAmount: String(parsed.data.rateAmount),
          createdById: session.user.id,
        })
        .returning({ id: rentals.id });

      await syncCarStatus(tx, parsed.data.carId);
      return rental.id;
    });

    revalidatePath("/rentals");
    revalidatePath("/cars");
    return { success: true, data: { id: rentalId } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not create rental." };
  }
}

export async function updateRental(
  rentalId: string,
  input: RentalInput,
): Promise<ActionResult<{ id: string }>> {
  await verifySession();
  const parsed = rentalInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await db.transaction(async (tx) => {
      const existing = await tx.query.rentals.findFirst({ where: eq(rentals.id, rentalId) });
      if (!existing) throw new Error("Rental not found.");

      if (parsed.data.status === "active") {
        const conflictingActive = await tx.query.rentals.findFirst({
          where: and(
            eq(rentals.carId, parsed.data.carId),
            eq(rentals.status, "active"),
            ne(rentals.id, rentalId),
          ),
        });
        if (conflictingActive) {
          throw new Error("This car already has an active rental.");
        }
      }

      await tx
        .update(rentals)
        .set({ ...parsed.data, rateAmount: String(parsed.data.rateAmount), updatedAt: new Date() })
        .where(eq(rentals.id, rentalId));

      await syncCarStatus(tx, parsed.data.carId);
      if (existing.carId !== parsed.data.carId) {
        await syncCarStatus(tx, existing.carId);
      }
    });

    revalidatePath("/rentals");
    revalidatePath(`/rentals/${rentalId}`);
    revalidatePath("/cars");
    return { success: true, data: { id: rentalId } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update rental." };
  }
}

export async function deleteRental(rentalId: string): Promise<ActionResult> {
  await verifySession();
  try {
    await db.transaction(async (tx) => {
      const existing = await tx.query.rentals.findFirst({ where: eq(rentals.id, rentalId) });
      if (!existing) throw new Error("Rental not found.");
      await tx.delete(rentals).where(eq(rentals.id, rentalId));
      await syncCarStatus(tx, existing.carId);
    });
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not delete rental." };
  }

  revalidatePath("/rentals");
  revalidatePath("/cars");
  return { success: true, data: undefined };
}
