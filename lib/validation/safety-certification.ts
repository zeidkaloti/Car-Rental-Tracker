import { z } from "zod";
import { optionalText } from "./shared";

export const CERT_RESULTS = ["pass", "fail"] as const;

export const safetyCertificationInputSchema = z.object({
  carId: z.string().min(1, "Car is required"),
  certDate: z.iso.date("Enter a valid date"),
  expiryDate: z.iso.date("Enter a valid date"),
  inspector: optionalText(200),
  result: z.enum(CERT_RESULTS),
  notes: optionalText(),
});

export type SafetyCertificationInput = z.output<typeof safetyCertificationInputSchema>;
export type SafetyCertificationFormInput = z.input<typeof safetyCertificationInputSchema>;
