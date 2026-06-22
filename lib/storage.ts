import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

export type DocumentEntityType = "renter" | "car" | "rental";

function dirFor(entityType: DocumentEntityType) {
  return path.join(UPLOAD_DIR, entityType);
}

export async function saveUploadedFile(
  entityType: DocumentEntityType,
  fileName: string,
  buffer: Buffer,
) {
  const ext = path.extname(fileName);
  const storedFileName = `${randomUUID()}${ext}`;
  const dir = dirFor(entityType);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedFileName), buffer);
  return storedFileName;
}

export async function readStoredFile(entityType: DocumentEntityType, storedFileName: string) {
  return readFile(path.join(dirFor(entityType), storedFileName));
}

export async function deleteStoredFile(entityType: DocumentEntityType, storedFileName: string) {
  await unlink(path.join(dirFor(entityType), storedFileName)).catch(() => {});
}
