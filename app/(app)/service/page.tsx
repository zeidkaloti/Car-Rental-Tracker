import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { getServiceStatus } from "@/lib/service-status";
import { ServiceStatusBadge } from "@/components/service/service-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ServicePage() {
  const allCars = await db.query.cars.findMany({
    orderBy: [asc(cars.make), asc(cars.model)],
    with: {
      serviceRecords: {
        orderBy: (t, { desc }) => [desc(t.serviceDate)],
        limit: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Service</h1>
        <p className="text-sm text-muted-foreground">
          Track maintenance history and mileage for every car. Select a car to view or add
          service records.
        </p>
      </div>

      {allCars.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cars yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car</TableHead>
              <TableHead>Current mileage</TableHead>
              <TableHead>Last service</TableHead>
              <TableHead>Miles since service</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCars.map((car) => {
              const status = getServiceStatus(
                car.mileage,
                car.serviceIntervalMiles,
                car.serviceRecords[0],
              );
              return (
                <TableRow key={car.id}>
                  <TableCell>
                    <Link href={`/service/${car.id}`} className="font-medium hover:underline">
                      {car.make} {car.model} ({car.plate})
                    </Link>
                  </TableCell>
                  <TableCell>{car.mileage.toLocaleString()} mi</TableCell>
                  <TableCell>
                    {status.lastServiceDate
                      ? status.lastServiceMileage != null
                        ? `${status.lastServiceDate} (${status.lastServiceMileage.toLocaleString()} mi)`
                        : status.lastServiceDate
                      : "Never"}
                  </TableCell>
                  <TableCell>{status.milesSinceService.toLocaleString()} mi</TableCell>
                  <TableCell>
                    <ServiceStatusBadge status={status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
