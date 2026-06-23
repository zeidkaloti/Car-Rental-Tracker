"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { insurancePolicies } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { insuranceInputSchema, type InsuranceInput } from "@/lib/validation/insurance";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createInsurancePolicy(
  input: InsuranceInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = insuranceInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [policy] = await db
    .insert(insurancePolicies)
    .values({ ...parsed.data, createdById: session.user.id })
    .returning({ id: insurancePolicies.id });

  revalidatePath(`/cars/${parsed.data.carId}`);
  return { success: true, data: { id: policy.id } };
}

export async function deleteInsurancePolicy(policyId: string): Promise<ActionResult> {
  await verifySession();
  const existing = await db.query.insurancePolicies.findFirst({
    where: eq(insurancePolicies.id, policyId),
  });
  await db.delete(insurancePolicies).where(eq(insurancePolicies.id, policyId));
  if (existing) {
    revalidatePath(`/cars/${existing.carId}`);
  }
  return { success: true, data: undefined };
}
