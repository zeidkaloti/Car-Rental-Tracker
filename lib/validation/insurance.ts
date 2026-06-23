import { z } from "zod";
import { optionalText } from "./shared";

export const insuranceInputSchema = z.object({
  carId: z.string().min(1, "Car is required"),
  startDate: z.iso.date("Enter a valid date"),
  expiryDate: z.iso.date("Enter a valid date"),
  provider: optionalText(100),
  policyNumber: optionalText(100),
  notes: optionalText(),
});

export type InsuranceInput = z.output<typeof insuranceInputSchema>;
export type InsuranceFormInput = z.input<typeof insuranceInputSchema>;
