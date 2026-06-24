import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CarsTable } from "@/components/cars/cars-table";

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
        <CarsTable cars={allCars} />
      )}
    </div>
  );
}
