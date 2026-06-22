import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { renters } from "@/db/schema";
import { RenterForm } from "@/components/forms/renter-form";

export default async function EditRenterPage({
  params,
}: {
  params: Promise<{ renterId: string }>;
}) {
  const { renterId } = await params;
  const renter = await db.query.renters.findFirst({ where: eq(renters.id, renterId) });

  if (!renter) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">
        Edit {renter.firstName} {renter.lastName}
      </h1>
      <RenterForm
        renterId={renter.id}
        defaultValues={{
          firstName: renter.firstName,
          lastName: renter.lastName,
          email: renter.email ?? undefined,
          phone: renter.phone ?? undefined,
          address: renter.address ?? undefined,
          licenseNumber: renter.licenseNumber ?? undefined,
          licenseExpiry: renter.licenseExpiry ?? undefined,
          notes: renter.notes ?? undefined,
        }}
      />
    </div>
  );
}
