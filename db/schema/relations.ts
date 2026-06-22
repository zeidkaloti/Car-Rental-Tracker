import { relations } from "drizzle-orm";
import { renters } from "./renters";
import { cars } from "./cars";
import { rentals } from "./rentals";
import { serviceRecords } from "./service-records";
import { safetyCertifications } from "./safety-certifications";
import { charges } from "./charges";
import { invoices } from "./invoices";

export const rentersRelations = relations(renters, ({ many }) => ({
  rentals: many(rentals),
  charges: many(charges),
  invoices: many(invoices),
}));

export const carsRelations = relations(cars, ({ many }) => ({
  rentals: many(rentals),
  serviceRecords: many(serviceRecords),
  safetyCertifications: many(safetyCertifications),
  charges: many(charges),
}));

export const rentalsRelations = relations(rentals, ({ one, many }) => ({
  renter: one(renters, { fields: [rentals.renterId], references: [renters.id] }),
  car: one(cars, { fields: [rentals.carId], references: [cars.id] }),
  charges: many(charges),
}));

export const serviceRecordsRelations = relations(serviceRecords, ({ one }) => ({
  car: one(cars, { fields: [serviceRecords.carId], references: [cars.id] }),
}));

export const safetyCertificationsRelations = relations(safetyCertifications, ({ one }) => ({
  car: one(cars, { fields: [safetyCertifications.carId], references: [cars.id] }),
}));

export const chargesRelations = relations(charges, ({ one }) => ({
  rental: one(rentals, { fields: [charges.rentalId], references: [rentals.id] }),
  renter: one(renters, { fields: [charges.renterId], references: [renters.id] }),
  car: one(cars, { fields: [charges.carId], references: [cars.id] }),
  invoice: one(invoices, { fields: [charges.invoiceId], references: [invoices.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  renter: one(renters, { fields: [invoices.renterId], references: [renters.id] }),
  charges: many(charges),
}));
