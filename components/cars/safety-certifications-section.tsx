"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SafetyCertificationForm } from "@/components/forms/safety-certification-form";
import { deleteSafetyCertification } from "@/actions/safety-certifications";

type SafetyCertification = {
  id: string;
  certDate: string;
  expiryDate: string;
  inspector: string | null;
  result: "pass" | "fail";
};

export function SafetyCertificationsSection({
  carId,
  certifications,
}: {
  carId: string;
  certifications: SafetyCertification[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete(certId: string) {
    const result = await deleteSafetyCertification(certId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Safety certifications</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            Add certification
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add safety certification</DialogTitle>
            </DialogHeader>
            <SafetyCertificationForm
              carId={carId}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {certifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No certifications on file.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cert date</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Result</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {certifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>{cert.certDate}</TableCell>
                <TableCell>{cert.expiryDate}</TableCell>
                <TableCell>{cert.inspector ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={cert.result === "pass" ? "default" : "destructive"}>
                    {cert.result}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)}>
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
