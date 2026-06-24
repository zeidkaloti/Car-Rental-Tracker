"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { CarStatusBadge } from "@/components/cars/car-status-badge"
import { ClickableTableRow } from "@/components/ui/clickable-table-row"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CAR_STATUSES } from "@/lib/validation/car"

type Car = {
  id: string
  make: string
  model: string
  year: number
  color: string | null
  plate: string
  vin: string
  mileage: number
  status: (typeof CAR_STATUSES)[number]
}

export function CarsTable({ cars }: { cars: Car[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cars
    return cars.filter((car) =>
      [car.make, car.model, String(car.year), car.color, car.plate, car.vin, car.status]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    )
  }, [cars, query])

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by make, model, plate, VIN, color, or status..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cars match your search.</p>
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
            {filtered.map((car) => (
              <ClickableTableRow key={car.id} href={`/cars/${car.id}`}>
                <TableCell className="font-medium">{car.make}</TableCell>
                <TableCell>{car.model}</TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell>{car.color ?? "—"}</TableCell>
                <TableCell>{car.plate}</TableCell>
                <TableCell>{car.vin}</TableCell>
                <TableCell>{car.mileage.toLocaleString()}</TableCell>
                <TableCell>
                  <CarStatusBadge status={car.status} />
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
