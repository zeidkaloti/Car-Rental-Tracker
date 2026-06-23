import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { CarForm } from "@/components/forms/car-form";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const car = await db.query.cars.findFirst({ where: eq(cars.id, carId) });

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">
        Edit {car.year} {car.make} {car.model}
      </h1>
      <CarForm
        carId={car.id}
        defaultValues={{
          make: car.make,
          model: car.model,
          year: car.year,
          vin: car.vin,
          plate: car.plate,
          color: car.color ?? undefined,
          mileage: car.mileage,
          serviceIntervalMiles: car.serviceIntervalMiles,
          status: car.status,
          notes: car.notes ?? undefined,
        }}
      />
    </div>
  );
}
