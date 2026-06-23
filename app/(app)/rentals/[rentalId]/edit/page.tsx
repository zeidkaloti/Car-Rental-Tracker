import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rentals } from "@/db/schema";
import { RentalForm } from "@/components/forms/rental-form";

export default async function EditRentalPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const { rentalId } = await params;
  const [rental, renters, cars] = await Promise.all([
    db.query.rentals.findFirst({ where: eq(rentals.id, rentalId) }),
    db.query.renters.findMany({ columns: { id: true, firstName: true, lastName: true } }),
    db.query.cars.findMany({
      columns: { id: true, make: true, model: true, plate: true, status: true },
    }),
  ]);

  if (!rental) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Edit rental</h1>
      <RentalForm
        rentalId={rental.id}
        renters={renters}
        cars={cars}
        defaultValues={{
          renterId: rental.renterId,
          carId: rental.carId,
          startDate: rental.startDate,
          endDate: rental.endDate ?? undefined,
          billingCadence: rental.billingCadence,
          rateAmount: Number(rental.rateAmount),
          serviceType: rental.serviceType,
          status: rental.status,
          notes: rental.notes ?? undefined,
        }}
      />
    </div>
  );
}
