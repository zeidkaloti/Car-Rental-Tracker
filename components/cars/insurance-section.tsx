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
import { InsuranceForm } from "@/components/forms/insurance-form";
import { deleteInsurancePolicy } from "@/actions/insurance";

type InsurancePolicy = {
  id: string;
  startDate: string;
  expiryDate: string;
  provider: string | null;
  policyNumber: string | null;
};

export function InsuranceSection({
  carId,
  policies,
}: {
  carId: string;
  policies: InsurancePolicy[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete(policyId: string) {
    const result = await deleteInsurancePolicy(policyId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Insurance</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            Add insurance
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add insurance policy</DialogTitle>
            </DialogHeader>
            <InsuranceForm
              carId={carId}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {policies.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insurance on file.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Policy #</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.startDate}</TableCell>
                <TableCell>{policy.expiryDate}</TableCell>
                <TableCell>{policy.provider ?? "—"}</TableCell>
                <TableCell>{policy.policyNumber ?? "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(policy.id)}>
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
