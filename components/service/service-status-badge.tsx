import { Badge } from "@/components/ui/badge";
import type { ServiceStatus } from "@/lib/service-status";

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  if (status.due) {
    return <Badge variant="destructive">Due for service</Badge>;
  }
  return <Badge variant="default">Up to date</Badge>;
}
