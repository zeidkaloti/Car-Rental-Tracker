import { db } from "@/db";
import { ChargeForm } from "@/components/forms/charge-form";

export default async function NewChargePage() {
  const [renters, cars, rentals] = await Promise.all([
    db.query.renters.findMany({ columns: { id: true, firstName: true, lastName: true } }),
    db.query.cars.findMany({ columns: { id: true, make: true, model: true, plate: true } }),
    db.query.rentals.findMany({
      columns: { id: true, renterId: true, carId: true, startDate: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Add charge</h1>
      <ChargeForm renters={renters} cars={cars} rentals={rentals} />
    </div>
  );
}
