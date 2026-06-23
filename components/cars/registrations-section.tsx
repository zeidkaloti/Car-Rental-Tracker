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
import { RegistrationForm } from "@/components/forms/registration-form";
import { deleteRegistration } from "@/actions/registrations";

type Registration = {
  id: string;
  registrationDate: string;
  expiryDate: string;
  registrationNumber: string | null;
};

export function RegistrationsSection({
  carId,
  registrations,
}: {
  carId: string;
  registrations: Registration[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete(registrationId: string) {
    const result = await deleteRegistration(registrationId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Registration</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            Add registration
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add registration</DialogTitle>
            </DialogHeader>
            <RegistrationForm
              carId={carId}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No registration on file.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Registration #</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>{registration.registrationDate}</TableCell>
                <TableCell>{registration.expiryDate}</TableCell>
                <TableCell>{registration.registrationNumber ?? "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(registration.id)}>
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
