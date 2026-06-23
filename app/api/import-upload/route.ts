import { NextResponse } from "next/server";
import { db } from "@/db";
import { importJobs } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { saveImportSourceFile } from "@/lib/storage";
import { parseSpreadsheet } from "@/lib/import/parse";
import { IMPORT_ENTITY_TYPES, type ImportEntityType } from "@/lib/import/registry";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await verifySession();

  const formData = await request.formData();
  const file = formData.get("file");
  const entityType = formData.get("entityType");

  if (!(file instanceof File) || typeof entityType !== "string") {
    return NextResponse.json({ error: "Missing file or entityType." }, { status: 400 });
  }
  if (!IMPORT_ENTITY_TYPES.includes(entityType as ImportEntityType)) {
    return NextResponse.json({ error: "Invalid entityType." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is empty or exceeds 20MB limit." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = parseSpreadsheet(buffer);
  } catch {
    return NextResponse.json({ error: "Could not parse this file as CSV or XLSX." }, { status: 400 });
  }

  if (parsed.headers.length === 0) {
    return NextResponse.json({ error: "File has no header row." }, { status: 400 });
  }

  const storedFileName = await saveImportSourceFile(file.name, buffer);

  const [job] = await db
    .insert(importJobs)
    .values({
      entityType: entityType as ImportEntityType,
      originalFileName: file.name,
      storedFileName,
      totalRows: parsed.rows.length,
      status: "pending",
      createdById: session.user.id,
    })
    .returning({ id: importJobs.id });

  return NextResponse.json({ jobId: job.id, headers: parsed.headers, rowCount: parsed.rows.length });
}
