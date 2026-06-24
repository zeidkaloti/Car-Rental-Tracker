"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
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

type Renter = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  licenseExpiry: string | null
}

export function RentersTable({ renters }: { renters: Renter[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return renters.filter((renter) =>
      matchesSearch(query, [renter.firstName, renter.lastName, renter.email, renter.phone]),
    )
  }, [renters, query])

  return (
    <div className="space-y-3">
      <Input
        type="search"
        placeholder="Search by name, email, or phone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No renters match your search.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((renter) => (
              <ClickableTableRow key={renter.id} href={`/renters/${renter.id}`}>
                <TableCell className="font-medium">
                  {renter.firstName} {renter.lastName}
                </TableCell>
                <TableCell>{renter.email ?? "—"}</TableCell>
                <TableCell>{renter.phone ?? "—"}</TableCell>
                <TableCell>{renter.licenseExpiry ?? "—"}</TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
