import { asc } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { getServiceStatus } from "@/lib/service-status";
import { ServiceTable } from "@/components/service/service-table";

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

  const rows = allCars.map((car) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    plate: car.plate,
    mileage: car.mileage,
    status: getServiceStatus(car.mileage, car.serviceIntervalMiles, car.serviceRecords[0]),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Service</h1>
        <p className="text-sm text-muted-foreground">
          Track maintenance history and mileage for every car. Select a car to view or add
          service records.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cars yet.</p>
      ) : (
        <ServiceTable cars={rows} />
      )}
    </div>
  );
}
