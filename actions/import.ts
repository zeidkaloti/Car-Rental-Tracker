"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { importJobs, renters, cars, rentals } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { readImportSourceFile } from "@/lib/storage";
import { parseSpreadsheet } from "@/lib/import/parse";
import { IMPORTABLE_ENTITIES, IMPORT_ENTITY_TYPES, type ImportEntityType } from "@/lib/import/registry";
import { rentalImportSchema } from "@/lib/validation/rental-import";

function isImportableEntityType(value: string): value is ImportEntityType {
  return (IMPORT_ENTITY_TYPES as string[]).includes(value);
}

export type ColumnMapping = Record<string, string>; // source header -> target field key ("" = skip)

type RowResult = {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
};

type PreviewResult = {
  rows: RowResult[];
  validCount: number;
  errorCount: number;
};

function applyMapping(headers: string[], row: string[], mapping: ColumnMapping) {
  const mapped: Record<string, string> = {};
  headers.forEach((header, i) => {
    const targetField = mapping[header];
    if (targetField) {
      mapped[targetField] = row[i] ?? "";
    }
  });
  return mapped;
}

async function loadParsedJob(jobId: string) {
  const job = await db.query.importJobs.findFirst({ where: eq(importJobs.id, jobId) });
  if (!job) throw new Error("Import job not found.");
  const buffer = await readImportSourceFile(job.storedFileName);
  const parsed = parseSpreadsheet(buffer);
  return { job, parsed };
}

export async function previewImportJob(
  jobId: string,
  mapping: ColumnMapping,
): Promise<{ success: true; data: PreviewResult } | { success: false; error: string }> {
  await verifySession();

  let job, parsed;
  try {
    ({ job, parsed } = await loadParsedJob(jobId));
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not read file." };
  }

  if (!isImportableEntityType(job.entityType)) {
    return { success: false, error: "This entity type is not yet importable." };
  }

  const entity = IMPORTABLE_ENTITIES[job.entityType];
  const rows: RowResult[] = parsed.rows.map((row, index) => {
    const data = applyMapping(parsed.headers, row, mapping);
    const result = entity.schema.safeParse(data);
    return {
      rowNumber: index + 1,
      data,
      errors: result.success ? [] : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  });

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  await db
    .update(importJobs)
    .set({
      columnMapping: mapping,
      totalRows: rows.length,
      successRows: validCount,
      errorRows: errorCount,
      errorDetail: rows.filter((r) => r.errors.length > 0).slice(0, 200),
      status: "ready",
    })
    .where(eq(importJobs.id, jobId));

  return { success: true, data: { rows, validCount, errorCount } };
}

export async function commitImportJob(
  jobId: string,
  mapping: ColumnMapping,
): Promise<{ success: true; data: { inserted: number; failed: number } } | { success: false; error: string }> {
  const session = await verifySession();

  let job, parsed;
  try {
    ({ job, parsed } = await loadParsedJob(jobId));
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not read file." };
  }

  if (!isImportableEntityType(job.entityType)) {
    return { success: false, error: "This entity type is not yet importable." };
  }
  const entityType = job.entityType;

  await db.update(importJobs).set({ status: "importing" }).where(eq(importJobs.id, jobId));

  // Combined rental import: find-or-create renter and car, then insert rental
  if (entityType === "rentals") {
    let inserted = 0;
    let failed = 0;

    for (const rawRow of parsed.rows) {
      const data = applyMapping(parsed.headers, rawRow, mapping);
      const result = rentalImportSchema.safeParse(data);
      if (!result.success) { failed++; continue; }
      const row = result.data;

      try {
        // Find or create renter
        let renterId: string;
        const existingRenter = row.licenseNumber
          ? await db.query.renters.findFirst({ where: eq(renters.licenseNumber, row.licenseNumber) })
          : await db.query.renters.findFirst({
              where: and(eq(renters.firstName, row.firstName), eq(renters.lastName, row.lastName)),
            });

        if (existingRenter) {
          renterId = existingRenter.id;
        } else {
          const [newRenter] = await db
            .insert(renters)
            .values({
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone,
              address: row.address,
              licenseNumber: row.licenseNumber,
              licenseExpiry: row.licenseExpiry,
              notes: row.renterNotes,
              createdById: session.user.id,
            })
            .returning({ id: renters.id });
          renterId = newRenter.id;
        }

        // Find or create car by plate
        let carId: string;
        const existingCar = await db.query.cars.findFirst({ where: eq(cars.plate, row.plate) });

        if (existingCar) {
          carId = existingCar.id;
        } else {
          if (!row.vin) { failed++; continue; }
          const [newCar] = await db
            .insert(cars)
            .values({
              make: row.make,
              model: row.model,
              year: row.year,
              vin: row.vin,
              plate: row.plate,
              color: row.color,
              mileage: row.mileage,
            })
            .returning({ id: cars.id });
          carId = newCar.id;
        }

        // Create the rental
        await db.insert(rentals).values({
          renterId,
          carId,
          startDate: row.startDate,
          endDate: row.endDate,
          billingCadence: row.billingCadence,
          rateAmount: String(row.rateAmount),
          serviceType: row.serviceType,
          status: row.status,
          notes: row.notes,
          createdById: session.user.id,
        });

        inserted++;
      } catch {
        failed++;
      }
    }

    await db
      .update(importJobs)
      .set({
        status: failed > 0 ? "completed_with_errors" : "completed",
        successRows: inserted,
        errorRows: failed,
        completedAt: new Date(),
      })
      .where(eq(importJobs.id, jobId));

    revalidatePath("/import");
    revalidatePath("/rentals");
    revalidatePath("/renters");
    revalidatePath("/cars");
    return { success: true, data: { inserted, failed } };
  }

  // Renters / Cars: validate all rows then batch insert
  const entity = IMPORTABLE_ENTITIES[entityType];
  const validRows: Record<string, unknown>[] = [];
  let failed = 0;

  for (const row of parsed.rows) {
    const data = applyMapping(parsed.headers, row, mapping);
    const result = entity.schema.safeParse(data);
    if (result.success) {
      validRows.push(result.data);
    } else {
      failed += 1;
    }
  }

  try {
    if (validRows.length > 0) {
      if (entityType === "renters") {
        await db
          .insert(renters)
          .values(validRows.map((r) => ({ ...r, createdById: session.user.id })) as (typeof renters.$inferInsert)[]);
      } else if (entityType === "cars") {
        await db.insert(cars).values(validRows as (typeof cars.$inferInsert)[]);
      }
    }
  } catch (err) {
    await db
      .update(importJobs)
      .set({ status: "failed", errorDetail: { message: err instanceof Error ? err.message : "Insert failed" } })
      .where(eq(importJobs.id, jobId));
    return { success: false, error: "Some rows could not be inserted (possible duplicate VIN or similar)." };
  }

  await db
    .update(importJobs)
    .set({
      status: failed > 0 ? "completed_with_errors" : "completed",
      successRows: validRows.length,
      errorRows: failed,
      completedAt: new Date(),
    })
    .where(eq(importJobs.id, jobId));

  revalidatePath("/import");
  revalidatePath(`/${entityType}`);
  return { success: true, data: { inserted: validRows.length, failed } };
}
