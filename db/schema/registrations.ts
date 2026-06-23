import { pgTable, text, timestamp, uuid, date, index } from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { user } from "./auth";
import { documents } from "./documents";

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    registrationDate: date("registration_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    registrationNumber: text("registration_number"),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("registrations_car_expiry_idx").on(table.carId, table.expiryDate)],
);
