import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { rentals } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Renter</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell>
                  <Link href={`/rentals/${rental.id}`} className="font-medium hover:underline">
                    {rental.renter.firstName} {rental.renter.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  {rental.car.make} {rental.car.model} ({rental.car.plate})
                </TableCell>
                <TableCell className="capitalize">{rental.billingCadence}</TableCell>
                <TableCell>${rental.rateAmount}</TableCell>
                <TableCell>{rental.startDate}</TableCell>
                <TableCell>{rental.endDate ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={rental.status === "active" ? "default" : "outline"}>
                    {rental.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
