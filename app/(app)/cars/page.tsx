import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CarStatusBadge } from "@/components/cars/car-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CarsPage() {
  const allCars = await db.query.cars.findMany({ orderBy: [desc(cars.createdAt)] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Cars</h1>
          <p className="text-sm text-muted-foreground">{allCars.length} total</p>
        </div>
        <Button render={<Link href="/cars/new" />}>Add car</Button>
      </div>

      {allCars.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cars yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <Link href={`/cars/${car.id}`} className="font-medium hover:underline">
                    {car.make}
                  </Link>
                </TableCell>
                <TableCell>{car.model}</TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell>{car.color ?? "—"}</TableCell>
                <TableCell>{car.plate}</TableCell>
                <TableCell>{car.vin}</TableCell>
                <TableCell>{car.mileage.toLocaleString()}</TableCell>
                <TableCell>
                  <CarStatusBadge status={car.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
