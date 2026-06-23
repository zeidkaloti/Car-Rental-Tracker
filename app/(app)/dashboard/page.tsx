import Link from "next/link";
import { count, eq, lte, and, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { rentals, registrations, insurancePolicies, charges } from "@/db/schema";
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

const REGISTRATION_LOOKAHEAD_DAYS = 30;

export default async function DashboardPage() {
  const [
    [activeRentals],
    [expiringRegistrations],
    [expiringInsurance],
    [unpaidCharges],
    expiringRegistrationList,
    expiringInsuranceList,
    unpaidChargeList,
    activeRentalList,
    completedRentalList,
  ] = await Promise.all([
    db.select({ count: count() }).from(rentals).where(eq(rentals.status, "active")),
    db
      .select({ count: count() })
      .from(registrations)
      .where(lte(registrations.expiryDate, sql`current_date + ${REGISTRATION_LOOKAHEAD_DAYS}::int`)),
    db
      .select({ count: count() })
      .from(insurancePolicies)
      .where(lte(insurancePolicies.expiryDate, sql`current_date + ${REGISTRATION_LOOKAHEAD_DAYS}::int`)),
    db
      .select({ total: sql<string>`coalesce(sum(${charges.amount}), 0)` })
      .from(charges)
      .where(and(eq(charges.status, "unpaid"))),
    db.query.registrations.findMany({
      where: lte(registrations.expiryDate, sql`current_date + ${REGISTRATION_LOOKAHEAD_DAYS}::int`),
      with: { car: true },
      orderBy: [registrations.expiryDate],
      limit: 5,
    }),
    db.query.insurancePolicies.findMany({
      where: lte(insurancePolicies.expiryDate, sql`current_date + ${REGISTRATION_LOOKAHEAD_DAYS}::int`),
      with: { car: true },
      orderBy: [insurancePolicies.expiryDate],
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
    db.query.rentals.findMany({
      where: eq(rentals.status, "completed"),
      with: { renter: true, car: true },
      orderBy: [desc(rentals.updatedAt)],
      limit: 5,
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <CardDescription>Registrations expiring within {REGISTRATION_LOOKAHEAD_DAYS} days</CardDescription>
              <CardTitle className="text-2xl">{expiringRegistrations.count}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/cars">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardDescription>Insurance expiring within {REGISTRATION_LOOKAHEAD_DAYS} days</CardDescription>
              <CardTitle className="text-2xl">{expiringInsurance.count}</CardTitle>
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Registrations expiring soon</h2>
          {expiringRegistrationList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing expiring in the next {REGISTRATION_LOOKAHEAD_DAYS} days.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border">
              {expiringRegistrationList.map((registration) => (
                <li key={registration.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <Link href={`/cars/${registration.car.id}`} className="hover:underline">
                    {registration.car.make} {registration.car.model} ({registration.car.plate})
                  </Link>
                  <Badge variant="outline">{registration.expiryDate}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Insurance expiring soon</h2>
          {expiringInsuranceList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing expiring in the next {REGISTRATION_LOOKAHEAD_DAYS} days.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border">
              {expiringInsuranceList.map((policy) => (
                <li key={policy.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <Link href={`/cars/${policy.car.id}`} className="hover:underline">
                    {policy.car.make} {policy.car.model} ({policy.car.plate})
                  </Link>
                  <Badge variant="outline">{policy.expiryDate}</Badge>
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

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Recently completed rentals</h2>
        {completedRentalList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed rentals yet.</p>
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
              {completedRentalList.map((rental) => (
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
