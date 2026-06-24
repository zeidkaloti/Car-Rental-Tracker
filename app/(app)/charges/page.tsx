import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { charges } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ChargesTable } from "@/components/charges/charges-table";

export default async function ChargesPage() {
  const allCharges = await db.query.charges.findMany({
    orderBy: [desc(charges.chargeDate)],
    with: { renter: true, car: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Tickets &amp; tolls</h1>
          <p className="text-sm text-muted-foreground">{allCharges.length} total</p>
        </div>
        <Button render={<Link href="/charges/new" />}>Add charge</Button>
      </div>

      {allCharges.length === 0 ? (
        <p className="text-sm text-muted-foreground">No charges recorded.</p>
      ) : (
        <ChargesTable charges={allCharges} />
      )}
    </div>
  );
}
