import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cars, documents } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarStatusBadge } from "@/components/cars/car-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmButton } from "@/components/forms/delete-confirm-button";
import { ServiceHistorySection } from "@/components/cars/service-history-section";
import { SafetyCertificationsSection } from "@/components/cars/safety-certifications-section";
import { DocumentsSection } from "@/components/documents/documents-section";
import { deleteCar } from "@/actions/cars";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const [car, carDocuments] = await Promise.all([
    db.query.cars.findFirst({
      where: eq(cars.id, carId),
      with: {
        rentals: { with: { renter: true } },
        serviceRecords: { orderBy: (t, { desc }) => [desc(t.serviceDate)] },
        safetyCertifications: { orderBy: (t, { desc }) => [desc(t.certDate)] },
      },
    }),
    db.query.documents.findMany({
      where: and(eq(documents.entityType, "car"), eq(documents.entityId, carId)),
    }),
  ]);

  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">
            {car.year} {car.make} {car.model}
          </h1>
          <CarStatusBadge status={car.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/cars/${car.id}/edit`} />}>
            Edit
          </Button>
          <DeleteConfirmButton
            itemLabel="car"
            id={car.id}
            action={deleteCar}
            redirectTo="/cars"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-muted-foreground">Plate</div>
          <div>{car.plate}</div>
        </div>
        <div>
          <div className="text-muted-foreground">VIN</div>
          <div>{car.vin}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Color</div>
          <div>{car.color ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Mileage</div>
          <div>{car.mileage.toLocaleString()}</div>
        </div>
      </div>

      {car.notes && (
        <div className="text-sm">
          <div className="text-muted-foreground">Notes</div>
          <p>{car.notes}</p>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Rental history</h2>
        {car.rentals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renter</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {car.rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <Link href={`/rentals/${rental.id}`} className="hover:underline">
                      {rental.renter.firstName} {rental.renter.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{rental.startDate}</TableCell>
                  <TableCell>{rental.endDate ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rental.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ServiceHistorySection carId={car.id} records={car.serviceRecords} />
      <SafetyCertificationsSection carId={car.id} certifications={car.safetyCertifications} />
      <DocumentsSection entityType="car" entityId={car.id} documents={carDocuments} />
    </div>
  );
}
