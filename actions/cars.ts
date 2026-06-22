"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { carInputSchema, type CarInput } from "@/lib/validation/car";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCar(input: CarInput): Promise<ActionResult<{ id: string }>> {
  await verifySession();
  const parsed = carInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [car] = await db.insert(cars).values(parsed.data).returning({ id: cars.id });
    revalidatePath("/cars");
    return { success: true, data: { id: car.id } };
  } catch {
    return { success: false, error: "A car with this VIN already exists." };
  }
}

export async function updateCar(
  carId: string,
  input: CarInput,
): Promise<ActionResult<{ id: string }>> {
  await verifySession();
  const parsed = carInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await db
      .update(cars)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(cars.id, carId));
  } catch {
    return { success: false, error: "A car with this VIN already exists." };
  }

  revalidatePath("/cars");
  revalidatePath(`/cars/${carId}`);
  return { success: true, data: { id: carId } };
}

export async function deleteCar(carId: string): Promise<ActionResult> {
  await verifySession();
  try {
    await db.delete(cars).where(eq(cars.id, carId));
  } catch {
    return {
      success: false,
      error: "This car has rental, service, or certification history and can't be deleted.",
    };
  }
  revalidatePath("/cars");
  return { success: true, data: undefined };
}
