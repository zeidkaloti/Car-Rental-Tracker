"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { ServiceStatusBadge } from "@/components/service/service-status-badge"
import { ClickableTableRow } from "@/components/ui/clickable-table-row"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ServiceStatus } from "@/lib/service-status"

type ServiceRow = {
  id: string
  make: string
  model: string
  plate: string
  mileage: number
  status: ServiceStatus
}

export function ServiceTable({ cars }: { cars: ServiceRow[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cars
    return cars.filter((car) =>
      [car.make, car.model, car.plate, car.status.due ? "due for service" : "up to date"].some(
        (field) => field.toLowerCase().includes(q),
      ),
    )
  }, [cars, query])

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by car, plate, or status..."
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
              <TableHead>Car</TableHead>
              <TableHead>Current mileage</TableHead>
              <TableHead>Last service</TableHead>
              <TableHead>Miles since service</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((car) => (
              <ClickableTableRow key={car.id} href={`/service/${car.id}`}>
                <TableCell className="font-medium">
                  {car.make} {car.model} ({car.plate})
                </TableCell>
                <TableCell>{car.mileage.toLocaleString()} mi</TableCell>
                <TableCell>
                  {car.status.lastServiceDate
                    ? car.status.lastServiceMileage != null
                      ? `${car.status.lastServiceDate} (${car.status.lastServiceMileage.toLocaleString()} mi)`
                      : car.status.lastServiceDate
                    : "Never"}
                </TableCell>
                <TableCell>{car.status.milesSinceService.toLocaleString()} mi</TableCell>
                <TableCell>
                  <ServiceStatusBadge status={car.status} />
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
