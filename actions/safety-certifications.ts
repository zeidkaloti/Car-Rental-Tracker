"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { safetyCertifications } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  safetyCertificationInputSchema,
  type SafetyCertificationInput,
} from "@/lib/validation/safety-certification";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createSafetyCertification(
  input: SafetyCertificationInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = safetyCertificationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [cert] = await db
    .insert(safetyCertifications)
    .values({ ...parsed.data, createdById: session.user.id })
    .returning({ id: safetyCertifications.id });

  revalidatePath(`/cars/${parsed.data.carId}`);
  return { success: true, data: { id: cert.id } };
}

export async function deleteSafetyCertification(certId: string): Promise<ActionResult> {
  await verifySession();
  const existing = await db.query.safetyCertifications.findFirst({
    where: eq(safetyCertifications.id, certId),
  });
  await db.delete(safetyCertifications).where(eq(safetyCertifications.id, certId));
  if (existing) {
    revalidatePath(`/cars/${existing.carId}`);
  }
  return { success: true, data: undefined };
}
