import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { renters } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { RentersTable } from "@/components/renters/renters-table";

export default async function RentersPage() {
  const allRenters = await db.query.renters.findMany({
    orderBy: [desc(renters.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Renters</h1>
          <p className="text-sm text-muted-foreground">{allRenters.length} total</p>
        </div>
        <Button render={<Link href="/renters/new" />}>Add renter</Button>
      </div>

      {allRenters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No renters yet.</p>
      ) : (
        <RentersTable renters={allRenters} />
      )}
    </div>
  );
}
