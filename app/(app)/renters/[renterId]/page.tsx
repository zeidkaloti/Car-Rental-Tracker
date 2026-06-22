import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { renters, documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmButton } from "@/components/forms/delete-confirm-button";
import { DocumentsSection } from "@/components/documents/documents-section";
import { deleteRenter } from "@/actions/renters";

export default async function RenterDetailPage({
  params,
}: {
  params: Promise<{ renterId: string }>;
}) {
  const { renterId } = await params;
  const [renter, renterDocuments] = await Promise.all([
    db.query.renters.findFirst({
      where: eq(renters.id, renterId),
      with: { rentals: { with: { car: true } } },
    }),
    db.query.documents.findMany({
      where: and(eq(documents.entityType, "renter"), eq(documents.entityId, renterId)),
    }),
  ]);

  if (!renter) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {renter.firstName} {renter.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Added {new Date(renter.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/renters/${renter.id}/edit`} />}>
            Edit
          </Button>
          <DeleteConfirmButton
            itemLabel="renter"
            id={renter.id}
            action={deleteRenter}
            redirectTo="/renters"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <div className="text-muted-foreground">Email</div>
          <div>{renter.email ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Phone</div>
          <div>{renter.phone ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Address</div>
          <div>{renter.address ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">License number</div>
          <div>{renter.licenseNumber ?? "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">License expiry</div>
          <div>{renter.licenseExpiry ?? "—"}</div>
        </div>
      </div>

      {renter.notes && (
        <div className="text-sm">
          <div className="text-muted-foreground">Notes</div>
          <p>{renter.notes}</p>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Rental history</h2>
        {renter.rentals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renter.rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <Link href={`/rentals/${rental.id}`} className="hover:underline">
                      {rental.car.make} {rental.car.model} ({rental.car.plate})
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

      <DocumentsSection entityType="renter" entityId={renter.id} documents={renterDocuments} />
    </div>
  );
}
