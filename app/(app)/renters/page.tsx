import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { renters } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRenters.map((renter) => (
              <TableRow key={renter.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/renters/${renter.id}`} className="font-medium hover:underline">
                    {renter.firstName} {renter.lastName}
                  </Link>
                </TableCell>
                <TableCell>{renter.email ?? "—"}</TableCell>
                <TableCell>{renter.phone ?? "—"}</TableCell>
                <TableCell>{renter.licenseExpiry ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
