"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceRecordForm } from "@/components/forms/service-record-form";
import { deleteServiceRecord } from "@/actions/service-records";

type ServiceRecord = {
  id: string;
  serviceDate: string;
  serviceType: string;
  vendor: string | null;
  cost: string | null;
  odometerReading: number | null;
};

export function ServiceHistorySection({
  carId,
  records,
}: {
  carId: string;
  records: ServiceRecord[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete(recordId: string) {
    const result = await deleteServiceRecord(recordId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Service history</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            Add service record
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add service record</DialogTitle>
            </DialogHeader>
            <ServiceRecordForm
              carId={carId}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No service records yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.serviceDate}</TableCell>
                <TableCell>{record.serviceType}</TableCell>
                <TableCell>{record.vendor ?? "—"}</TableCell>
                <TableCell>{record.cost ? `$${record.cost}` : "—"}</TableCell>
                <TableCell>{record.odometerReading?.toLocaleString() ?? "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
