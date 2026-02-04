"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { NoticeBoard } from "@/components/notice-board"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Clock } from "lucide-react"
import { useSimplePolling } from "@/lib/use-simple-polling"

interface Ticket {
  id: string
  number: string
  subject: string
  status: string
  urgency: "low" | "medium" | "high" | "critical"
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}

const statusColors = {
  "Aberto": "bg-blue-500",
  "Pendente": "bg-yellow-500",
  "Fechado": "bg-gray-500",
  "Resolvido": "bg-green-500",
  "Aguardando Aprovação": "bg-orange-500",
}

const urgencyColors = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
}

const urgencyLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // Buscar sessão
        const sessionResponse = await fetch("/api/auth/get-session")
        const session = await sessionResponse.json()
        
        if (session?.user) {
          setUser(session.user)
          
          // Buscar tickets do usuário
          await fetchTickets()
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  // Função para buscar tickets
  const fetchTickets = async () => {
    try {
      const ticketsResponse = await fetch("/api/tickets")
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData)
      }
    } catch (error) {
      console.error("Erro ao buscar tickets:", error)
    }
  }

  // Sistema de tempo real com polling simples
  const { isActive, lastUpdate, forceUpdate, interval } = useSimplePolling({
    onUpdate: (data) => {
      console.log('Atualização recebida via polling:', data)
      fetchTickets()
    },
    enabled: !!user,
    interval: 10000 // 10 segundos
  })

  // Escutar evento de criação de chamado (fallback)
  useEffect(() => {
    const handleTicketCreated = () => {
      console.log("Evento ticketCreated recebido na Home - atualizando tickets...")
      fetchTickets()
    }

    window.addEventListener('ticketCreated', handleTicketCreated)

    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
    }
  }, [])

  const activeTickets = tickets.filter(t => t.status !== "Fechado" && t.status !== "Resolvido")
  const recentTickets = tickets.slice(0, 5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1 flex items-center gap-2">
          Olá, {user?.name || "Usuário"} 
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Que bom te ver por aqui! Acompanhe seus chamados e avisos abaixo.
        </p>
      </div>

      {/* Grid - Meus chamados recentes e Mural de avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Meus Chamados Recentes */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">Meus chamados</h2>
                  {/* Indicador de polling */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                    {isActive ? (
                      <>
                        <Wifi className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          Polling ({interval}s)
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-600">Desconectado</span>
                      </>
                    )}
                    <span className="text-xs text-green-500">({lastUpdate})</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{tickets.length} chamados</p>
              </div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              {activeTickets.length} ativos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Carregando chamados...</p>
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Nenhum chamado ainda</h3>
                <p className="text-xs text-muted-foreground mb-4">Crie seu primeiro chamado clicando no botão acima</p>
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">#{ticket.number}</span>
                          <Badge variant="outline" className={`${urgencyColors[ticket.urgency]} text-xs border`}>
                            {urgencyLabels[ticket.urgency]}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{ticket.subject}</h3>
                      </div>
                      <Badge className={`${statusColors[ticket.status as keyof typeof statusColors]} text-white text-xs ml-2`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link href="/tickets">
            <button className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors">
              Ver todos os chamados
            </button>
          </Link>
        </div>

        {/* Mural de Avisos */}
        <NoticeBoard />
      </div>
    </div>
  )
}
