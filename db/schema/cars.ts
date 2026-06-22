import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";

export const carStatusEnum = pgEnum("car_status", [
  "available",
  "rented",
  "in_service",
  "out_of_service",
]);

export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull().unique(),
  plate: text("plate").notNull(),
  color: text("color"),
  mileage: integer("mileage").notNull().default(0),
  status: carStatusEnum("status").notNull().default("available"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
