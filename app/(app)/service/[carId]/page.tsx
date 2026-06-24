import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { getServiceStatus } from "@/lib/service-status";
import { ServiceStatusBadge } from "@/components/service/service-status-badge";
import { ServiceHistorySection } from "@/components/cars/service-history-section";
import { BackButton } from "@/components/ui/back-button";

export default async function CarServicePage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const car = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    with: {
      serviceRecords: { orderBy: (t, { desc }) => [desc(t.serviceDate)] },
    },
  });

  if (!car) {
    notFound();
  }

  const status = getServiceStatus(car.mileage, car.serviceIntervalKm, car.serviceRecords[0]);

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          {car.year} {car.make} {car.model} ({car.plate})
        </h1>
        <ServiceStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-muted-foreground">Current mileage</div>
          <div>{car.mileage.toLocaleString()} km</div>
        </div>
        <div>
          <div className="text-muted-foreground">Service interval</div>
          <div>{car.serviceIntervalKm.toLocaleString()} km</div>
        </div>
        <div>
          <div className="text-muted-foreground">Last service</div>
          <div>
            {status.lastServiceDate
              ? status.lastServiceMileage != null
                ? `${status.lastServiceDate} (${status.lastServiceMileage.toLocaleString()} km)`
                : status.lastServiceDate
              : "Never"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Km since service</div>
          <div>{status.kmSinceService.toLocaleString()} km</div>
        </div>
      </div>

      <Link href={`/cars/${car.id}`} className="text-sm text-muted-foreground hover:underline">
        View full car details →
      </Link>

      <ServiceHistorySection carId={car.id} records={car.serviceRecords} />
    </div>
  );
}
