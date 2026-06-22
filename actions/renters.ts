"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { renters } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { renterInputSchema, type RenterInput } from "@/lib/validation/renter";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createRenter(input: RenterInput): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = renterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [renter] = await db
    .insert(renters)
    .values({ ...parsed.data, createdById: session.user.id })
    .returning({ id: renters.id });

  revalidatePath("/renters");
  return { success: true, data: { id: renter.id } };
}

export async function updateRenter(
  renterId: string,
  input: RenterInput,
): Promise<ActionResult<{ id: string }>> {
  await verifySession();
  const parsed = renterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(renters)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(renters.id, renterId));

  revalidatePath("/renters");
  revalidatePath(`/renters/${renterId}`);
  return { success: true, data: { id: renterId } };
}

export async function deleteRenter(renterId: string): Promise<ActionResult> {
  await verifySession();
  try {
    await db.delete(renters).where(eq(renters.id, renterId));
  } catch {
    return {
      success: false,
      error: "This renter has rental or charge history and can't be deleted.",
    };
  }
  revalidatePath("/renters");
  return { success: true, data: undefined };
}
