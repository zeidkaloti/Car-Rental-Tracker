"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { registrationInputSchema, type RegistrationInput } from "@/lib/validation/registration";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createRegistration(
  input: RegistrationInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await verifySession();
  const parsed = registrationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [registration] = await db
    .insert(registrations)
    .values({ ...parsed.data, createdById: session.user.id })
    .returning({ id: registrations.id });

  revalidatePath(`/cars/${parsed.data.carId}`);
  return { success: true, data: { id: registration.id } };
}

export async function deleteRegistration(registrationId: string): Promise<ActionResult> {
  await verifySession();
  const existing = await db.query.registrations.findFirst({
    where: eq(registrations.id, registrationId),
  });
  await db.delete(registrations).where(eq(registrations.id, registrationId));
  if (existing) {
    revalidatePath(`/cars/${existing.carId}`);
  }
  return { success: true, data: undefined };
}
