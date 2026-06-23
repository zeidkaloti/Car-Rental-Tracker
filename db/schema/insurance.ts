import { pgTable, text, timestamp, uuid, date, index } from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { user } from "./auth";
import { documents } from "./documents";

export const insurancePolicies = pgTable(
  "insurance_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    provider: text("provider"),
    policyNumber: text("policy_number"),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("insurance_policies_car_expiry_idx").on(table.carId, table.expiryDate)],
);
