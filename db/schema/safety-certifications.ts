import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { user } from "./auth";
import { documents } from "./documents";

export const certResultEnum = pgEnum("cert_result", ["pass", "fail"]);

export const safetyCertifications = pgTable(
  "safety_certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    certDate: date("cert_date").notNull(),
    expiryDate: date("expiry_date").notNull(),
    inspector: text("inspector"),
    result: certResultEnum("result").notNull(),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [index("safety_certs_car_expiry_idx").on(table.carId, table.expiryDate)],
);
