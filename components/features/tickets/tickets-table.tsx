"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { type FilterType } from "@/lib/mock-tickets"

interface Ticket {
  id: string
  number: string
  subject: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  createdAt: string
  updatedAt: string
  requester: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
}

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
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error("Erro ao buscar chamados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Escutar evento de criação/atualização de chamado e polling a cada 8 segundos
  useEffect(() => {
    const handleTicketCreated = () => {
      console.log("Evento ticketCreated recebido na tabela - atualizando tickets...")
      fetchTickets()
    }

    const handleTicketUpdated = () => {
      console.log("Evento ticketUpdated recebido na tabela - atualizando tickets...")
      fetchTickets()
    }

    window.addEventListener('ticketCreated', handleTicketCreated)
    window.addEventListener('ticketUpdated', handleTicketUpdated)
    
    // Polling a cada 8 segundos para garantir atualização em tempo real
    const interval = setInterval(() => {
      console.log("🔄 Polling: Atualizando tickets automaticamente...")
      fetchTickets()
    }, 8000)

    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
      window.removeEventListener('ticketUpdated', handleTicketUpdated)
      clearInterval(interval)
    }
  }, [])

  const filteredTickets = useMemo(() => {
    let filtered = tickets

    // Aplicar filtro por status
    switch (activeFilter) {
      case "pending":
        filtered = tickets.filter(ticket => ticket.status === "Pendente" || ticket.status === "Aberto")
        break
      case "closed":
        filtered = tickets.filter(ticket => ticket.status === "Fechado")
        break
      case "resolved":
        filtered = tickets.filter(ticket => ticket.status === "Resolvido")
        break
      case "awaiting-approval":
        filtered = tickets.filter(ticket => ticket.status === "Aguardando Aprovação")
        break
      case "all":
      default:
        filtered = tickets
        break
    }

    // Aplicar busca por texto
    if (searchTerm && searchTerm.length >= 3) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(ticket =>
        ticket.number.toLowerCase().includes(search) ||
        ticket.subject.toLowerCase().includes(search) ||
        ticket.requester.name.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search) ||
        ticket.status.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [tickets, activeFilter, searchTerm])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando chamados...</p>
        </div>
      </div>
    )
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
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="py-2 px-2">
                      <Checkbox onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="py-2 px-2">
                      <Link href={`/tickets/${ticket.id}`} className="text-xs text-foreground font-medium hover:text-blue-600">
                        {ticket.number}
                      </Link>
                    </td>
                    <td className="py-2 px-2">
                      <Link href={`/tickets/${ticket.id}`} className="text-xs text-foreground max-w-[120px] truncate block hover:text-blue-600" title={ticket.subject}>
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden md:table-cell max-w-[100px] truncate" title={ticket.assignedTo?.name || "Não atribuído"}>
                      {ticket.assignedTo?.name || "Não atribuído"}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden lg:table-cell max-w-[80px] truncate" title={ticket.category}>
                      {ticket.category}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-1 h-4 rounded-full ${urgencyColors[ticket.urgency]}`} title={ticket.urgency} />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden sm:table-cell">{formatDate(ticket.updatedAt)}</td>
                    <td className="py-2 px-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1 py-0 text-white ${statusColors[ticket.status as keyof typeof statusColors]}`}
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
