import { pgTable, text, timestamp, uuid, date, numeric, integer } from "drizzle-orm/pg-core";
import { cars } from "./cars";
import { user } from "./auth";

export const serviceRecords = pgTable("service_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  serviceDate: date("service_date").notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  vendor: text("vendor"),
  odometerReading: integer("odometer_reading"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdById: text("created_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
});
