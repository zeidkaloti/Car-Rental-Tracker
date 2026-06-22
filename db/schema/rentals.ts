import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { renters } from "./renters";
import { cars } from "./cars";
import { user } from "./auth";

export const billingCadenceEnum = pgEnum("billing_cadence", [
  "weekly",
  "biweekly",
  "monthly",
]);

export const rentalStatusEnum = pgEnum("rental_status", [
  "active",
  "completed",
  "cancelled",
]);

export const rentals = pgTable(
  "rentals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    renterId: uuid("renter_id")
      .notNull()
      .references(() => renters.id, { onDelete: "restrict" }),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    billingCadence: billingCadenceEnum("billing_cadence").notNull(),
    rateAmount: numeric("rate_amount", { precision: 10, scale: 2 }).notNull(),
    status: rentalStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("rentals_car_status_idx").on(table.carId, table.status),
    index("rentals_renter_status_idx").on(table.renterId, table.status),
  ],
);
