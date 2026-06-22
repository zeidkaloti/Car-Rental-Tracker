"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { deleteStoredFile } from "@/lib/storage";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  await verifySession();
  const document = await db.query.documents.findFirst({ where: eq(documents.id, documentId) });
  if (!document) {
    return { success: false, error: "Document not found." };
  }

  await db.delete(documents).where(eq(documents.id, documentId));
  await deleteStoredFile(document.entityType, document.storedFileName);

  revalidatePath(`/${document.entityType}s/${document.entityId}`);
  return { success: true, data: undefined };
}
