"use client"

import { useState } from "react"
import { TicketsFilters } from "@/components/tickets-filters"
import { TicketsTable } from "@/components/tickets-table"
import { NoticeBoard } from "@/components/notice-board"
import type { FilterType } from "@/lib/mock-tickets"

export default function TicketsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Layout responsivo */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Seção principal - Filtros e Tabela */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <TicketsFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <TicketsTable activeFilter={activeFilter} />
        </div>
        
        {/* Mural de Avisos - apenas em telas grandes */}
        <div className="hidden xl:block w-[400px] border-l border-border">
          <div className="p-6">
            <NoticeBoard />
          </div>
        </div>
      </div>
    </div>
  )
}
