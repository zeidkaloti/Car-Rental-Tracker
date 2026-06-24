"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClickableTableRow } from "@/components/ui/clickable-table-row"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { matchesSearch } from "@/lib/search"
import { SERVICE_TYPE_LABELS } from "@/lib/validation/rental"

type Rental = {
  id: string
  billingCadence: string
  rateAmount: string
  serviceType: keyof typeof SERVICE_TYPE_LABELS
  startDate: string
  endDate: string | null
  status: string
  renter: { id: string; firstName: string; lastName: string }
  car: { make: string; model: string; plate: string }
}

export function RentalsTable({ rentals }: { rentals: Rental[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return rentals.filter((rental) =>
      matchesSearch(query, [
        rental.renter.firstName,
        rental.renter.lastName,
        rental.car.make,
        rental.car.model,
        rental.car.plate,
        rental.billingCadence,
        rental.status,
      ]),
    )
  }, [rentals, query])

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by renter, car, plate, or status..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rentals match your search.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Renter</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Use</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rental) => (
              <ClickableTableRow key={rental.id} href={`/rentals/${rental.id}`}>
                <TableCell className="font-medium">
                  <Link href={`/renters/${rental.renter.id}`} className="hover:underline">
                    {rental.renter.firstName} {rental.renter.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  {rental.car.make} {rental.car.model} ({rental.car.plate})
                </TableCell>
                <TableCell className="capitalize">{rental.billingCadence}</TableCell>
                <TableCell>${rental.rateAmount}</TableCell>
                <TableCell>{SERVICE_TYPE_LABELS[rental.serviceType]}</TableCell>
                <TableCell>{rental.startDate}</TableCell>
                <TableCell>{rental.endDate ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={rental.status === "active" ? "default" : "outline"}>
                    {rental.status}
                  </Badge>
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
