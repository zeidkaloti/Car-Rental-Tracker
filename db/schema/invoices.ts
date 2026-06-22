import { pgTable, timestamp, uuid, date, numeric, pgEnum } from "drizzle-orm/pg-core";
import { renters } from "./renters";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "void",
]);

// Not yet surfaced in any UI — exists so charges.invoiceId has somewhere to
// point once an autobill/invoicing feature is built, without altering
// already-live charges rows.
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  renterId: uuid("renter_id")
    .notNull()
    .references(() => renters.id, { onDelete: "restrict" }),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  issuedDate: date("issued_date"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
