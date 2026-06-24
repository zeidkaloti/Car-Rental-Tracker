"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function ClickableTableRow({
  href,
  className,
  ...props
}: React.ComponentProps<typeof TableRow> & { href: string }) {
  const router = useRouter()

  return (
    <TableRow
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return
        router.push(href)
      }}
      {...props}
    />
  )
}
