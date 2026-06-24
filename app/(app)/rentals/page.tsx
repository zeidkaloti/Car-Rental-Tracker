import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { rentals } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { RentalsTable } from "@/components/rentals/rentals-table";

export default async function RentalsPage() {
  const allRentals = await db.query.rentals.findMany({
    orderBy: [desc(rentals.createdAt)],
    with: { renter: true, car: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Rentals</h1>
          <p className="text-sm text-muted-foreground">{allRentals.length} total</p>
        </div>
        <Button render={<Link href="/rentals/new" />}>Create rental</Button>
      </div>

      {allRentals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rentals yet.</p>
      ) : (
        <RentalsTable rentals={allRentals} />
      )}
    </div>
  );
}
