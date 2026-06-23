import Link from "next/link";
import { count, eq, desc, sql, and, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { cars, rentals, charges, renters } from "@/db/schema";
import { SERVICE_TYPE_LABELS } from "@/lib/validation/rental";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarList } from "@/components/analytics/bar-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AnalyticsPage() {
  const [
    fleetByStatus,
    rentalsByServiceType,
    activeRentalsByCadence,
    [chargesSummary],
    chargesByType,
    [avgDuration],
    topRenters,
  ] = await Promise.all([
    db.select({ status: cars.status, count: count() }).from(cars).groupBy(cars.status),
    db
      .select({ serviceType: rentals.serviceType, count: count() })
      .from(rentals)
      .groupBy(rentals.serviceType),
    db
      .select({ cadence: rentals.billingCadence, count: count() })
      .from(rentals)
      .where(eq(rentals.status, "active"))
      .groupBy(rentals.billingCadence),
    db
      .select({
        total: sql<string>`coalesce(sum(${charges.amount}), 0)`,
        paid: sql<string>`coalesce(sum(case when ${charges.status} = 'paid' then ${charges.amount} else 0 end), 0)`,
        unpaid: sql<string>`coalesce(sum(case when ${charges.status} = 'unpaid' then ${charges.amount} else 0 end), 0)`,
        count: count(),
      })
      .from(charges),
    db
      .select({ type: charges.type, count: count(), total: sql<string>`coalesce(sum(${charges.amount}), 0)` })
      .from(charges)
      .groupBy(charges.type),
    db
      .select({
        avgDays: sql<string>`coalesce(avg(${rentals.endDate}::date - ${rentals.startDate}::date), 0)`,
      })
      .from(rentals)
      .where(and(eq(rentals.status, "completed"), isNotNull(rentals.endDate))),
    db
      .select({
        renterId: charges.renterId,
        firstName: renters.firstName,
        lastName: renters.lastName,
        total: sql<string>`coalesce(sum(${charges.amount}), 0)`,
        count: count(),
      })
      .from(charges)
      .innerJoin(renters, eq(charges.renterId, renters.id))
      .groupBy(charges.renterId, renters.firstName, renters.lastName)
      .orderBy(desc(sql`sum(${charges.amount})`))
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Aggregate trends across the fleet, rentals, and charges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total charges billed</CardDescription>
            <CardTitle className="text-2xl">${chargesSummary.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Charges paid</CardDescription>
            <CardTitle className="text-2xl">${chargesSummary.paid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Charges unpaid</CardDescription>
            <CardTitle className="text-2xl">${chargesSummary.unpaid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. completed rental length</CardDescription>
            <CardTitle className="text-2xl">{Math.round(Number(avgDuration?.avgDays ?? 0))} days</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Fleet status</h2>
          <BarList
            items={fleetByStatus.map((row) => ({
              label: row.status.replace(/_/g, " "),
              value: row.count,
            }))}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Rentals by vehicle use</h2>
          <BarList
            items={rentalsByServiceType.map((row) => ({
              label: SERVICE_TYPE_LABELS[row.serviceType],
              value: row.count,
            }))}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Active rentals by billing cadence</h2>
          <BarList
            items={activeRentalsByCadence.map((row) => ({
              label: row.cadence,
              value: row.count,
            }))}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Charges by type</h2>
          <BarList
            items={chargesByType.map((row) => ({
              label: row.type,
              value: row.count,
              displayValue: `${row.count} · $${row.total}`,
            }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Top renters by charges</h2>
        {topRenters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No charges recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renter</TableHead>
                <TableHead># Charges</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRenters.map((renter) => (
                <TableRow key={renter.renterId}>
                  <TableCell>
                    <Link href={`/renters/${renter.renterId}`} className="hover:underline">
                      {renter.firstName} {renter.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{renter.count}</TableCell>
                  <TableCell>${renter.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
