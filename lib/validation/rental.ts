import { z } from "zod";
import { optionalText, optionalDate, money } from "./shared";

export const BILLING_CADENCES = ["weekly", "biweekly", "monthly"] as const;
export const RENTAL_STATUSES = ["active", "completed", "cancelled"] as const;
export const RENTAL_SERVICE_TYPES = [
  "uber",
  "uber_eats",
  "lyft",
  "doordash",
  "instacart",
  "personal",
  "other",
] as const;

export const rentalInputSchema = z.object({
  renterId: z.string().min(1, "Renter is required"),
  carId: z.string().min(1, "Car is required"),
  startDate: z.iso.date("Enter a valid start date"),
  endDate: optionalDate(),
  billingCadence: z.enum(BILLING_CADENCES),
  rateAmount: money("Enter a valid rate"),
  serviceType: z.enum(RENTAL_SERVICE_TYPES).default("other"),
  status: z.enum(RENTAL_STATUSES).default("active"),
  notes: optionalText(),
});

export type RentalInput = z.output<typeof rentalInputSchema>;
export type RentalFormInput = z.input<typeof rentalInputSchema>;

export const SERVICE_TYPE_LABELS: Record<(typeof RENTAL_SERVICE_TYPES)[number], string> = {
  uber: "Uber",
  uber_eats: "Uber Eats",
  lyft: "Lyft",
  doordash: "DoorDash",
  instacart: "Instacart",
  personal: "Personal",
  other: "Other",
};

export const RENTAL_FIELD_LABELS: Record<keyof RentalInput, string> = {
  renterId: "Renter",
  carId: "Car",
  startDate: "Start date",
  endDate: "End date",
  billingCadence: "Billing cadence",
  rateAmount: "Rate amount",
  serviceType: "Vehicle use",
  status: "Status",
  notes: "Notes",
};
