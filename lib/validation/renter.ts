import { z } from "zod";
import { optionalText, optionalDate } from "./shared";

export const renterInputSchema = z.object({
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
  notes: optionalText(),
});

// renterInputSchema uses z.preprocess for several fields ("" -> undefined),
// so its input type (raw form values) and output type (validated/normalized
// values) differ — react-hook-form + zodResolver need both, see renter-form.tsx.
export type RenterInput = z.output<typeof renterInputSchema>;
export type RenterFormInput = z.input<typeof renterInputSchema>;

export const RENTER_FIELD_LABELS: Record<keyof RenterInput, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  licenseNumber: "License number",
  licenseExpiry: "License expiry",
  notes: "Notes",
};
