"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setChargeStatus, deleteCharge } from "@/actions/charges";

export function ChargeRowActions({
  chargeId,
  status,
}: {
  chargeId: string;
  status: "paid" | "unpaid";
}) {
  const router = useRouter();

  async function toggleStatus() {
    const result = await setChargeStatus(chargeId, status === "paid" ? "unpaid" : "paid");
    if (!result.success) {
      toast.error(result.error ?? "Could not update.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    const result = await deleteCharge(chargeId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    toast.success("Charge deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="outline" size="sm" onClick={toggleStatus}>
        Mark {status === "paid" ? "unpaid" : "paid"}
      </Button>
      <Button variant="ghost" size="sm" render={<Link href={`/charges/${chargeId}/edit`} />}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
