"use client"

import { Button } from "@/components/ui/button"
import type { FilterType } from "@/lib/mock-tickets"

interface TicketsFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function TicketsFilters({ activeFilter, onFilterChange }: TicketsFiltersProps) {
  const filterButtons = [
    { key: "all" as FilterType, label: "Todos os tickets" },
    { key: "pending" as FilterType, label: "Tickets pendentes" },
    { key: "closed" as FilterType, label: "Tickets fechados" },
    { key: "awaiting-approval" as FilterType, label: "Tickets aguardando aprovação" },
  ]

  return (
    <div className="w-full lg:w-64 lg:min-w-64 lg:max-w-64 border-b lg:border-b-0 lg:border-r border-border bg-card flex-shrink-0">
      {/* Header */}
      <div className="p-2 lg:p-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
      </div>

      {/* Filter Options */}
      <div className="p-2 lg:p-3 h-[calc(100vh-8rem)] overflow-y-auto">
        <nav className="space-y-1">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              variant="ghost"
              className={`w-full justify-start font-normal text-xs h-auto py-1.5 px-2 text-left leading-tight ${
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              onClick={() => onFilterChange(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}
