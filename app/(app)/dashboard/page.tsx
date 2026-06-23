import Link from "next/link";
import { count, eq, lte, and, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { rentals, safetyCertifications, charges } from "@/db/schema";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CERT_LOOKAHEAD_DAYS = 30;

export default async function DashboardPage() {
  const [
    [activeRentals],
    [expiringCerts],
    [unpaidCharges],
    expiringCertList,
    unpaidChargeList,
    activeRentalList,
  ] = await Promise.all([
    db.select({ count: count() }).from(rentals).where(eq(rentals.status, "active")),
    db
      .select({ count: count() })
      .from(safetyCertifications)
      .where(lte(safetyCertifications.expiryDate, sql`current_date + ${CERT_LOOKAHEAD_DAYS}::int`)),
    db
      .select({ total: sql<string>`coalesce(sum(${charges.amount}), 0)` })
      .from(charges)
      .where(and(eq(charges.status, "unpaid"))),
    db.query.safetyCertifications.findMany({
      where: lte(safetyCertifications.expiryDate, sql`current_date + ${CERT_LOOKAHEAD_DAYS}::int`),
      with: { car: true },
      orderBy: [safetyCertifications.expiryDate],
      limit: 5,
    }),
    db.query.charges.findMany({
      where: eq(charges.status, "unpaid"),
      with: { renter: true },
      orderBy: [desc(charges.chargeDate)],
      limit: 5,
    }),
    db.query.rentals.findMany({
      where: eq(rentals.status, "active"),
      with: { renter: true, car: true },
      orderBy: [desc(rentals.startDate)],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of current rentals, cars, and outstanding charges.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/rentals">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardDescription>Active rentals</CardDescription>
              <CardTitle className="text-2xl">{activeRentals.count}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/cars">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardDescription>Certifications expiring within {CERT_LOOKAHEAD_DAYS} days</CardDescription>
              <CardTitle className="text-2xl">{expiringCerts.count}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/charges">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardDescription>Unpaid charges</CardDescription>
              <CardTitle className="text-2xl">${unpaidCharges.total}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Certifications expiring soon</h2>
          {expiringCertList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing expiring in the next {CERT_LOOKAHEAD_DAYS} days.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border">
              {expiringCertList.map((cert) => (
                <li key={cert.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <Link href={`/cars/${cert.car.id}`} className="hover:underline">
                    {cert.car.make} {cert.car.model} ({cert.car.plate})
                  </Link>
                  <Badge variant="outline">{cert.expiryDate}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Recent unpaid charges</h2>
          {unpaidChargeList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unpaid charges.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border">
              {unpaidChargeList.map((charge) => (
                <li key={charge.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <Link href={`/renters/${charge.renter.id}`} className="hover:underline">
                    {charge.renter.firstName} {charge.renter.lastName}
                  </Link>
                  <span>${charge.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Active rentals</h2>
        {activeRentalList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active rentals.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renter</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>End date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRentalList.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <Link href={`/renters/${rental.renter.id}`} className="hover:underline">
                      {rental.renter.firstName} {rental.renter.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/cars/${rental.car.id}`} className="hover:underline">
                      {rental.car.make} {rental.car.model} ({rental.car.plate})
                    </Link>
                  </TableCell>
                  <TableCell>{rental.startDate}</TableCell>
                  <TableCell>{rental.endDate ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
