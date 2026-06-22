import { pgTable, text, timestamp, uuid, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const importEntityTypeEnum = pgEnum("import_entity_type", [
  "renters",
  "cars",
  "rentals",
  "service_records",
]);

export const importStatusEnum = pgEnum("import_status", [
  "pending",
  "validating",
  "ready",
  "importing",
  "completed",
  "completed_with_errors",
  "failed",
]);

export const importJobs = pgTable("import_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: importEntityTypeEnum("entity_type").notNull(),
  originalFileName: text("original_file_name").notNull(),
  storedFileName: text("stored_file_name").notNull(),
  columnMapping: jsonb("column_mapping"),
  totalRows: integer("total_rows"),
  successRows: integer("success_rows"),
  errorRows: integer("error_rows"),
  errorDetail: jsonb("error_detail"),
  status: importStatusEnum("status").notNull().default("pending"),
  createdById: text("created_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
