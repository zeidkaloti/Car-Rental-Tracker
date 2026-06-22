import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { charges } from "@/db/schema";
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
import { ChargeRowActions } from "@/components/charges/charge-row-actions";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Renter</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCharges.map((charge) => (
              <TableRow key={charge.id}>
                <TableCell>
                  <Link href={`/renters/${charge.renter.id}`} className="hover:underline">
                    {charge.renter.firstName} {charge.renter.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  {charge.car.make} {charge.car.model} ({charge.car.plate})
                </TableCell>
                <TableCell className="capitalize">{charge.type}</TableCell>
                <TableCell>{charge.chargeDate}</TableCell>
                <TableCell>${charge.amount}</TableCell>
                <TableCell>
                  <Badge variant={charge.status === "unpaid" ? "destructive" : "default"}>
                    {charge.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ChargeRowActions chargeId={charge.id} status={charge.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
