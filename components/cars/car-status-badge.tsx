import { Badge } from "@/components/ui/badge";
import type { CAR_STATUSES } from "@/lib/validation/car";

const VARIANTS: Record<(typeof CAR_STATUSES)[number], "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  rented: "secondary",
  in_service: "outline",
  out_of_service: "destructive",
};

const LABELS: Record<(typeof CAR_STATUSES)[number], string> = {
  available: "Available",
  rented: "Rented",
  in_service: "In service",
  out_of_service: "Out of service",
};

export function CarStatusBadge({ status }: { status: (typeof CAR_STATUSES)[number] }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
