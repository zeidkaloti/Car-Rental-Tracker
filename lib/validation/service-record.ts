import { z } from "zod";
import { optionalText, money } from "./shared";

export const serviceRecordInputSchema = z.object({
  carId: z.string().min(1, "Car is required"),
  serviceDate: z.iso.date("Enter a valid date"),
  serviceType: z.string().trim().min(1, "Service type is required").max(100),
  description: optionalText(),
  cost: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    money("Enter a valid cost").optional(),
  ),
  vendor: optionalText(200),
  odometerReading: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number("Enter a valid odometer reading").int().nonnegative().optional(),
  ),
});

export type ServiceRecordInput = z.output<typeof serviceRecordInputSchema>;
export type ServiceRecordFormInput = z.input<typeof serviceRecordInputSchema>;
