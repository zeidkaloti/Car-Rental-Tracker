"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { charges } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { chargeInputSchema, type ChargeInput } from "@/lib/validation/charge";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCharge(input: ChargeInput): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = chargeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [charge] = await db
    .insert(charges)
    .values({ ...parsed.data, amount: String(parsed.data.amount), createdById: session.user.id })
    .returning({ id: charges.id });

  revalidatePath("/charges");
  return { success: true, data: { id: charge.id } };
}

export async function updateCharge(
  chargeId: string,
  input: ChargeInput,
): Promise<ActionResult<{ id: string }>> {
  await verifySession();
  const parsed = chargeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(charges)
    .set({ ...parsed.data, amount: String(parsed.data.amount) })
    .where(eq(charges.id, chargeId));

  revalidatePath("/charges");
  revalidatePath(`/charges/${chargeId}`);
  return { success: true, data: { id: chargeId } };
}

export async function setChargeStatus(
  chargeId: string,
  status: "paid" | "unpaid",
): Promise<ActionResult> {
  await verifySession();
  await db.update(charges).set({ status }).where(eq(charges.id, chargeId));
  revalidatePath("/charges");
  return { success: true, data: undefined };
}

export async function deleteCharge(chargeId: string): Promise<ActionResult> {
  await verifySession();
  await db.delete(charges).where(eq(charges.id, chargeId));
  revalidatePath("/charges");
  return { success: true, data: undefined };
}
