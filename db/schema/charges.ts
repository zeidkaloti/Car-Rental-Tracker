import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { renters } from "./renters";
import { cars } from "./cars";
import { rentals } from "./rentals";
import { invoices } from "./invoices";
import { user } from "./auth";

export const chargeTypeEnum = pgEnum("charge_type", ["ticket", "toll", "other"]);
export const chargeStatusEnum = pgEnum("charge_status", ["unpaid", "paid"]);

export const charges = pgTable("charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  rentalId: uuid("rental_id").references(() => rentals.id, { onDelete: "set null" }),
  renterId: uuid("renter_id")
    .notNull()
    .references(() => renters.id, { onDelete: "restrict" }),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "restrict" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  chargeDate: date("charge_date").notNull(),
  type: chargeTypeEnum("type").notNull(),
  status: chargeStatusEnum("status").notNull().default("unpaid"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdById: text("created_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
