"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => router.back()}
    >
      <ArrowLeft />
      Back
    </Button>
  )
}
