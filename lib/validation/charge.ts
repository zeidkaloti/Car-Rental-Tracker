import { z } from "zod";
import { optionalText, money } from "./shared";

export const CHARGE_TYPES = ["ticket", "toll", "other"] as const;
export const CHARGE_STATUSES = ["unpaid", "paid"] as const;

export const chargeInputSchema = z.object({
  renterId: z.string().min(1, "Renter is required"),
  carId: z.string().min(1, "Car is required"),
  rentalId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  amount: money("Enter a valid amount"),
  chargeDate: z.iso.date("Enter a valid date"),
  type: z.enum(CHARGE_TYPES),
  status: z.enum(CHARGE_STATUSES).default("unpaid"),
  notes: optionalText(),
});

export type ChargeInput = z.output<typeof chargeInputSchema>;
export type ChargeFormInput = z.input<typeof chargeInputSchema>;
