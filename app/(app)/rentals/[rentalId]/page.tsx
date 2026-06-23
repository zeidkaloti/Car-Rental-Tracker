import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rentals, documents } from "@/db/schema";
import { SERVICE_TYPE_LABELS } from "@/lib/validation/rental";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmButton } from "@/components/forms/delete-confirm-button";
import { DocumentsSection } from "@/components/documents/documents-section";
import { deleteRental } from "@/actions/rentals";

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const { rentalId } = await params;
  const [rental, rentalDocuments] = await Promise.all([
    db.query.rentals.findFirst({
      where: eq(rentals.id, rentalId),
      with: { renter: true, car: true },
    }),
    db.query.documents.findMany({
      where: and(eq(documents.entityType, "rental"), eq(documents.entityId, rentalId)),
    }),
  ]);

  if (!rental) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">
            <Link href={`/renters/${rental.renter.id}`} className="hover:underline">
              {rental.renter.firstName} {rental.renter.lastName}
            </Link>{" "}
            ·{" "}
            <Link href={`/cars/${rental.car.id}`} className="hover:underline">
              {rental.car.make} {rental.car.model}
            </Link>
          </h1>
          <Badge variant={rental.status === "active" ? "default" : "outline"}>
            {rental.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/rentals/${rental.id}/edit`} />}>
            Edit
          </Button>
          <DeleteConfirmButton
            itemLabel="rental"
            id={rental.id}
            action={deleteRental}
            redirectTo="/rentals"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-muted-foreground">Billing cadence</div>
          <div className="capitalize">{rental.billingCadence}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Rate</div>
          <div>${rental.rateAmount}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Vehicle use</div>
          <div>{SERVICE_TYPE_LABELS[rental.serviceType]}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Start date</div>
          <div>{rental.startDate}</div>
        </div>
        <div>
          <div className="text-muted-foreground">End date</div>
          <div>{rental.endDate ?? "—"}</div>
        </div>
      </div>

      {rental.notes && (
        <div className="text-sm">
          <div className="text-muted-foreground">Notes</div>
          <p>{rental.notes}</p>
        </div>
      )}

      <DocumentsSection entityType="rental" entityId={rental.id} documents={rentalDocuments} />
    </div>
  );
}
