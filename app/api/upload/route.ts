import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, renters, cars, rentals } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { saveUploadedFile, type DocumentEntityType } from "@/lib/storage";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

async function entityExists(entityType: DocumentEntityType, entityId: string) {
  switch (entityType) {
    case "renter":
      return Boolean(await db.query.renters.findFirst({ where: eq(renters.id, entityId) }));
    case "car":
      return Boolean(await db.query.cars.findFirst({ where: eq(cars.id, entityId) }));
    case "rental":
      return Boolean(await db.query.rentals.findFirst({ where: eq(rentals.id, entityId) }));
  }
}

export async function POST(request: Request) {
  const session = await verifySession();

  const formData = await request.formData();
  const file = formData.get("file");
  const entityType = formData.get("entityType");
  const entityId = formData.get("entityId");
  const description = formData.get("description");

  if (!(file instanceof File) || typeof entityType !== "string" || typeof entityId !== "string") {
    return NextResponse.json({ error: "Missing file, entityType, or entityId." }, { status: 400 });
  }

  if (!["renter", "car", "rental"].includes(entityType)) {
    return NextResponse.json({ error: "Invalid entityType." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 20MB limit." }, { status: 400 });
  }

  const type = entityType as DocumentEntityType;
  if (!(await entityExists(type, entityId))) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedFileName = await saveUploadedFile(type, file.name, buffer);

  const [document] = await db
    .insert(documents)
    .values({
      entityType: type,
      entityId,
      fileName: file.name,
      storedFileName,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      description: typeof description === "string" && description ? description : undefined,
      uploadedById: session.user.id,
    })
    .returning();

  revalidatePath(`/${type}s/${entityId}`);
  return NextResponse.json({ document });
}
