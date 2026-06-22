import { count, eq, lte, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { rentals, safetyCertifications, charges } from "@/db/schema";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CERT_LOOKAHEAD_DAYS = 30;

export default async function DashboardPage() {
  const [[activeRentals], [expiringCerts], [unpaidCharges]] = await Promise.all([
    db.select({ count: count() }).from(rentals).where(eq(rentals.status, "active")),
    db
      .select({ count: count() })
      .from(safetyCertifications)
      .where(
        lte(
          safetyCertifications.expiryDate,
          sql`current_date + ${CERT_LOOKAHEAD_DAYS}::int`,
        ),
      ),
    db
      .select({ total: sql<string>`coalesce(sum(${charges.amount}), 0)` })
      .from(charges)
      .where(and(eq(charges.status, "unpaid"))),
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
        <Card>
          <CardHeader>
            <CardDescription>Active rentals</CardDescription>
            <CardTitle className="text-2xl">{activeRentals.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Certifications expiring within {CERT_LOOKAHEAD_DAYS} days</CardDescription>
            <CardTitle className="text-2xl">{expiringCerts.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unpaid charges</CardDescription>
            <CardTitle className="text-2xl">${unpaidCharges.total}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
