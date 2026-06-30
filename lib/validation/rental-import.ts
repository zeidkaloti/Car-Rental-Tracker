import { z } from "zod";
import { optionalText, optionalDate, money } from "./shared";
import { BILLING_CADENCES, RENTAL_STATUSES, RENTAL_SERVICE_TYPES } from "./rental";

export const rentalImportSchema = z.object({
  // Renter
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.email("Enter a valid email").optional(),
  ),
  phone: optionalText(50),
  address: optionalText(500),
  licenseNumber: optionalText(100),
  licenseExpiry: optionalDate(),
  renterNotes: optionalText(),

  // Car — VIN is optional here; required only when the car doesn't already exist in the DB
  make: z.string().trim().min(1, "Car make is required").max(100),
  model: z.string().trim().min(1, "Car model is required").max(100),
  year: z.coerce.number("Enter a valid year").int().min(1900).max(2100),
  vin: optionalText(50),
  plate: z.string().trim().min(1, "Plate is required").max(20),
  color: optionalText(50),
  mileage: z.coerce.number().int().nonnegative().default(0),

  // Rental
  startDate: z.iso.date("Enter a valid start date"),
  endDate: optionalDate(),
  billingCadence: z.enum(BILLING_CADENCES),
  rateAmount: money("Enter a valid rate"),
  serviceType: z.enum(RENTAL_SERVICE_TYPES).default("other"),
  status: z.enum(RENTAL_STATUSES).default("active"),
  notes: optionalText(),
});

export type RentalImportInput = z.output<typeof rentalImportSchema>;

export const RENTAL_IMPORT_FIELD_LABELS: Record<keyof RentalImportInput, string> = {
  firstName: "Renter first name",
  lastName: "Renter last name",
  email: "Renter email",
  phone: "Renter phone",
  address: "Renter address",
  licenseNumber: "License number",
  licenseExpiry: "License expiry",
  renterNotes: "Renter notes",
  make: "Car make",
  model: "Car model",
  year: "Car year",
  vin: "VIN",
  plate: "Plate",
  color: "Color",
  mileage: "Mileage",
  startDate: "Start date",
  endDate: "End date",
  billingCadence: "Billing cadence",
  rateAmount: "Rate amount",
  serviceType: "Vehicle use",
  status: "Rental status",
  notes: "Rental notes",
};
