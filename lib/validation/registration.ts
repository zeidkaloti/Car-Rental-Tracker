import { z } from "zod";
import { optionalText } from "./shared";

export const registrationInputSchema = z.object({
  carId: z.string().min(1, "Car is required"),
  registrationDate: z.iso.date("Enter a valid date"),
  expiryDate: z.iso.date("Enter a valid date"),
  registrationNumber: optionalText(100),
  notes: optionalText(),
});

export type RegistrationInput = z.output<typeof registrationInputSchema>;
export type RegistrationFormInput = z.input<typeof registrationInputSchema>;
