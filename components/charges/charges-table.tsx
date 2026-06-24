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
import { ChargeRowActions } from "@/components/charges/charge-row-actions"
import { matchesSearch } from "@/lib/search"

type Charge = {
  id: string
  type: string
  chargeDate: string
  amount: string
  status: "paid" | "unpaid"
  renter: { id: string; firstName: string; lastName: string }
  car: { make: string; model: string; plate: string }
}

export function ChargesTable({ charges }: { charges: Charge[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return charges.filter((charge) =>
      matchesSearch(query, [
        charge.renter.firstName,
        charge.renter.lastName,
        charge.car.make,
        charge.car.model,
        charge.car.plate,
        charge.type,
        charge.status,
      ]),
    )
  }, [charges, query])

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by renter, car, type, or status..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No charges match your search.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Renter</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((charge) => (
              <ClickableTableRow key={charge.id} href={`/charges/${charge.id}/edit`}>
                <TableCell className="font-medium">
                  <Link href={`/renters/${charge.renter.id}`} className="hover:underline">
                    {charge.renter.firstName} {charge.renter.lastName}
                  </Link>
                </TableCell>
                <TableCell>
                  {charge.car.make} {charge.car.model} ({charge.car.plate})
                </TableCell>
                <TableCell className="capitalize">{charge.type}</TableCell>
                <TableCell>{charge.chargeDate}</TableCell>
                <TableCell>${charge.amount}</TableCell>
                <TableCell>
                  <Badge variant={charge.status === "unpaid" ? "destructive" : "default"}>
                    {charge.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ChargeRowActions chargeId={charge.id} status={charge.status} />
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
