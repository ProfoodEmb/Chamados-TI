"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NoticeBoard } from "@/components/features/notices/notice-board"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react"

interface Ticket {
  id: string
  number: string
  subject: string
  status: string
  urgency: "low" | "medium" | "high" | "critical"
  createdAt: string
  kanbanStatus: string
  assignedToId?: string | null
  requesterId?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  team: string
  empresa: string | null
}

interface PersonalStats {
  resolved: number
  inProgress: number
  inReview: number
  total: number
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
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/get-session")
        
        if (!sessionResponse.ok) {
          console.error("Erro ao buscar sessão:", sessionResponse.status)
          setIsLoading(false)
          return
        }

        const text = await sessionResponse.text()
        if (!text) {
          console.error("Resposta vazia da API de sessão")
          setIsLoading(false)
          return
        }

        const session = JSON.parse(text)
        
        if (session?.user) {
          setUser(session.user)
          await fetchTickets()
          
          // Se for usuário TI, buscar estatísticas pessoais
          const isTIUser = session.user.role === "admin" || 
                          session.user.role === "lider_infra" || 
                          session.user.role === "func_infra" || 
                          session.user.role === "lider_sistemas" || 
                          session.user.role === "func_sistemas"
          
          if (isTIUser) {
            await fetchPersonalStats(session.user.id)
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const fetchTickets = async () => {
    try {
      const ticketsResponse = await fetch("/api/tickets")
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        setTickets(ticketsData)
        console.log('✅ [HOME] Tickets atualizados:', ticketsData.length)
      }
    } catch (error) {
      console.error("Erro ao buscar tickets:", error)
    }
  }

  const fetchPersonalStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`)
      if (response.ok) {
        const stats = await response.json()
        setPersonalStats(stats)
        console.log('✅ [HOME] Estatísticas pessoais:', stats)
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas pessoais:", error)
    }
  }

  // Polling a cada 60 segundos para atualizações
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      fetchTickets()
      
      const isTIUser = user.role === "admin" || 
                      user.role === "lider_infra" || 
                      user.role === "func_infra" || 
                      user.role === "lider_sistemas" || 
                      user.role === "func_sistemas"
      
      if (isTIUser) {
        fetchPersonalStats(user.id)
      }
    }, 60000) // 60 segundos

    return () => {
      clearInterval(interval)
    }
  }, [user])

  // Filtrar chamados do usuário (criados ou atribuídos) - apenas os 3 mais recentes
  const myRecentTickets = user ? tickets.filter(ticket => 
    ticket.requesterId === user.id || ticket.assignedToId === user.id
  ).slice(0, 3) : []
  
  const recentTickets = tickets.slice(0, 4)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      open: { label: "Aberto", className: "bg-blue-100 text-blue-800 border-blue-200" },
      in_progress: { label: "Em Andamento", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      resolved: { label: "Resolvido", className: "bg-green-100 text-green-800 border-green-200" },
      closed: { label: "Fechado", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    return statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" }
  }

  const isTIUser = user?.role === "admin" || 
                   user?.role === "lider_infra" || 
                   user?.role === "func_infra" || 
                   user?.role === "lider_sistemas" || 
                   user?.role === "func_sistemas"
  
  const isFuncOrLiderOrAdmin = user?.role?.includes("func") || user?.role?.includes("lider") || user?.role === "admin"

  return (
    <div className="min-h-screen max-h-screen overflow-y-scroll bg-gradient-to-br from-gray-50 to-gray-100 p-4 scrollbar-visible">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {user?.name?.split(" ")[0] || "Usuário"}! 👋
            </h1>
          </div>
        </div>

        {/* Personal Stats for TI Users */}
        {isTIUser && personalStats && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Minhas Estatísticas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Chamados atribuídos */}
              <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                    <TicketIcon className="w-4 h-4 text-purple-700" />
                  </div>
                  <Badge className="text-[10px] bg-purple-200 text-purple-800 border-0 px-1.5 py-0.5">Meus</Badge>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-0.5">{personalStats.total}</h3>
                <p className="text-[10px] text-purple-700 font-medium">Chamados atribuídos</p>
              </Card>

              {/* 2. Em andamento */}
              <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-700" />
                  </div>
                  <Badge className="text-[10px] bg-blue-200 text-blue-800 border-0 px-1.5 py-0.5">Trabalhando</Badge>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-0.5">{personalStats.inProgress}</h3>
                <p className="text-[10px] text-blue-700 font-medium">Em andamento</p>
              </Card>

              {/* 3. Aguardando revisão */}
              <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-orange-700" />
                  </div>
                  <Badge className="text-[10px] bg-orange-200 text-orange-800 border-0 px-1.5 py-0.5">Revisão</Badge>
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-0.5">{personalStats.inReview}</h3>
                <p className="text-[10px] text-orange-700 font-medium">Aguardando revisão</p>
              </Card>

              {/* 4. Chamados concluídos */}
              <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                  </div>
                  <Badge className="text-[10px] bg-green-200 text-green-800 border-0 px-1.5 py-0.5">Resolvidos</Badge>
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-0.5">{personalStats.resolved}</h3>
                <p className="text-[10px] text-green-700 font-medium">Chamados concluídos</p>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Notices */}
          <div>
            <NoticeBoard />
          </div>

          {/* Recent Tickets Section */}
          {isFuncOrLiderOrAdmin && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Chamados Recentes</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/tickets')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {myRecentTickets.length > 0 ? (
                <div className="space-y-2">
                  {myRecentTickets.map((ticket) => {
                    const statusInfo = getStatusBadge(ticket.status)
                    const isMyTicket = ticket.requesterId === user?.id
                    return (
                      <Card 
                        key={ticket.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-mono text-gray-500 font-semibold">#{ticket.number}</span>
                              {isMyTicket && (
                                <Badge className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 border-purple-200">
                                  Meu Chamado
                                </Badge>
                              )}
                              <Badge className={`text-[10px] px-2 py-0.5 ${statusInfo.className}`}>
                                {statusInfo.label}
                              </Badge>
                              <Badge className={`text-[10px] px-2 py-0.5 ${urgencyColors[ticket.urgency as keyof typeof urgencyColors]}`}>
                                {urgencyLabels[ticket.urgency as keyof typeof urgencyLabels]}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                              {ticket.subject}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Criado em {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center bg-white">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <TicketIcon className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Nenhum chamado recente</p>
                    <p className="text-xs mt-1">Você não tem chamados criados ou atribuídos</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
