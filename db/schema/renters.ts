import { pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const renters = pgTable("renters", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  licenseNumber: text("license_number"),
  licenseExpiry: date("license_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdById: text("created_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
