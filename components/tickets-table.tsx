"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mockTickets, filterTickets, type FilterType } from "@/lib/mock-tickets"

const urgencyColors = {
  critical: "bg-red-500",
  high: "bg-gray-800",
  medium: "bg-yellow-500",
  low: "bg-green-500",
}

const statusColors = {
  "Aberto": "bg-blue-500",
  "Pendente": "bg-yellow-500",
  "Fechado": "bg-gray-500",
  "Resolvido": "bg-green-500",
  "Aguardando Aprovação": "bg-orange-500",
}

interface TicketsTableProps {
  activeFilter: FilterType
}

export function TicketsTable({ activeFilter }: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredTickets = useMemo(() => {
    return filterTickets(mockTickets, activeFilter, searchTerm)
  }, [activeFilter, searchTerm])

  const handleRowClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Table Container with Overflow */}
      <div className="flex-1 overflow-auto">
        <div className="border-l border-r border-b border-border bg-card h-full">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr className="border-b border-border">
                <th className="w-8 py-2 px-2">
                  <Checkbox />
                </th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground">Número ↓</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground">Assunto</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground hidden md:table-cell">Responsável</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground hidden lg:table-cell">Categoria</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground">Urgência</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground hidden sm:table-cell">Data da última ação</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground">Status</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-foreground hidden xl:table-cell">Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 px-4 text-center text-muted-foreground text-sm">
                    {searchTerm.length >= 3 
                      ? "Nenhum chamado encontrado para sua busca."
                      : "Nenhum chamado encontrado para este filtro."
                    }
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleRowClick(ticket.id)}
                    className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="py-2 px-2">
                      <Checkbox />
                    </td>
                    <td className="py-2 px-2 text-xs text-foreground font-medium">{ticket.number}</td>
                    <td className="py-2 px-2 text-xs text-foreground max-w-[120px] truncate" title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden md:table-cell max-w-[100px] truncate" title={ticket.responsible}>
                      {ticket.responsible}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden lg:table-cell max-w-[80px] truncate" title={ticket.category}>
                      {ticket.category}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-1 h-4 rounded-full ${urgencyColors[ticket.urgency]}`} title={ticket.urgency} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden sm:table-cell">{ticket.lastAction}</td>
                    <td className="py-2 px-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1 py-0 text-white ${statusColors[ticket.status]}`}
                      >
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden xl:table-cell">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
