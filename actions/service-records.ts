"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { serviceRecords } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  serviceRecordInputSchema,
  type ServiceRecordInput,
} from "@/lib/validation/service-record";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createServiceRecord(
  input: ServiceRecordInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = serviceRecordInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [record] = await db
    .insert(serviceRecords)
    .values({
      ...parsed.data,
      cost: parsed.data.cost !== undefined ? String(parsed.data.cost) : undefined,
      createdById: session.user.id,
    })
    .returning({ id: serviceRecords.id });

  revalidatePath(`/cars/${parsed.data.carId}`);
  return { success: true, data: { id: record.id } };
}

export async function deleteServiceRecord(recordId: string): Promise<ActionResult> {
  await verifySession();
  const existing = await db.query.serviceRecords.findFirst({
    where: eq(serviceRecords.id, recordId),
  });
  await db.delete(serviceRecords).where(eq(serviceRecords.id, recordId));
  if (existing) {
    revalidatePath(`/cars/${existing.carId}`);
  }
  return { success: true, data: undefined };
}
