"use client"

import { useState } from "react"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsTable } from "@/components/tickets-table"
import type { FilterType } from "@/lib/mock-tickets"

export default function TicketsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  return (
    <div className="h-screen flex overflow-hidden">
      <TicketsFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <TicketsTable activeFilter={activeFilter} />
    </div>
  )
}
