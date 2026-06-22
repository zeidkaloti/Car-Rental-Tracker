import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { charges } from "@/db/schema";
import { ChargeForm } from "@/components/forms/charge-form";

export default async function EditChargePage({
  params,
}: {
  params: Promise<{ chargeId: string }>;
}) {
  const { chargeId } = await params;
  const [charge, renters, cars, rentals] = await Promise.all([
    db.query.charges.findFirst({ where: eq(charges.id, chargeId) }),
    db.query.renters.findMany({ columns: { id: true, firstName: true, lastName: true } }),
    db.query.cars.findMany({ columns: { id: true, make: true, model: true, plate: true } }),
    db.query.rentals.findMany({
      columns: { id: true, renterId: true, carId: true, startDate: true },
    }),
  ]);

  if (!charge) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Edit charge</h1>
      <ChargeForm
        chargeId={charge.id}
        renters={renters}
        cars={cars}
        rentals={rentals}
        defaultValues={{
          renterId: charge.renterId,
          carId: charge.carId,
          rentalId: charge.rentalId ?? undefined,
          amount: Number(charge.amount),
          chargeDate: charge.chargeDate,
          type: charge.type,
          status: charge.status,
          notes: charge.notes ?? undefined,
        }}
      />
    </div>
  );
}
