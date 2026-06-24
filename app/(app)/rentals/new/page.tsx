import { db } from "@/db";
import { RentalForm } from "@/components/forms/rental-form";
import { BackButton } from "@/components/ui/back-button";

export default async function NewRentalPage() {
  const [renters, cars] = await Promise.all([
    db.query.renters.findMany({ columns: { id: true, firstName: true, lastName: true } }),
    db.query.cars.findMany({
      columns: { id: true, make: true, model: true, plate: true, status: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-lg font-semibold text-foreground">Create rental</h1>
      <RentalForm renters={renters} cars={cars} />
    </div>
  );
}
