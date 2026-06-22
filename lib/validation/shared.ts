import { z } from "zod";

// HTML form inputs submit "" for empty optional fields — normalize to
// undefined before the inner schema runs, instead of repeating this in
// every optional string/date field across every entity schema.
export const optionalText = (max = 2000) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().trim().max(max).optional(),
  );

export const optionalDate = () =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.iso.date("Enter a valid date").optional(),
  );

export const money = (message = "Enter a valid amount") =>
  z.coerce.number(message).nonnegative(message);
