import { z } from "zod";
import { optionalText } from "./shared";

export const CAR_STATUSES = ["available", "rented", "in_service", "out_of_service"] as const;

export const carInputSchema = z.object({
  make: z.string().trim().min(1, "Make is required").max(100),
  model: z.string().trim().min(1, "Model is required").max(100),
  year: z.coerce.number("Enter a valid year").int().min(1900).max(2100),
  vin: z.string().trim().min(1, "VIN is required").max(50),
  plate: z.string().trim().min(1, "Plate is required").max(20),
  color: optionalText(50),
  mileage: z.coerce.number("Enter a valid mileage").int().nonnegative().default(0),
  serviceIntervalKm: z.coerce
    .number("Enter a valid interval")
    .int()
    .positive()
    .default(8000),
  status: z.enum(CAR_STATUSES).default("available"),
  notes: optionalText(),
});

export type CarInput = z.output<typeof carInputSchema>;
export type CarFormInput = z.input<typeof carInputSchema>;

export const CAR_FIELD_LABELS: Record<keyof CarInput, string> = {
  make: "Make",
  model: "Model",
  year: "Year",
  vin: "VIN",
  plate: "Plate",
  color: "Color",
  mileage: "Mileage",
  serviceIntervalKm: "Service interval (km)",
  status: "Status",
  notes: "Notes",
};
