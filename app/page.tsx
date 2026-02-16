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
  TrendingUp,
  Plus,
  ArrowRight,
  Users,
  BarChart3
} from "lucide-react"

interface Ticket {
  id: string
  number: string
  subject: string
  status: string
  urgency: "low" | "medium" | "high" | "critical"
  createdAt: string
  kanbanStatus: string
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

  const activeTickets = tickets.filter(t => t.kanbanStatus !== "done")
  const reviewTickets = tickets.filter(t => t.kanbanStatus === "review")
  const doneTickets = tickets.filter(t => t.kanbanStatus === "done")
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

  const isAdmin = user?.role === "admin" || user?.role?.includes("lider") || user?.role?.includes("func")
  const isTIUser = user?.role === "admin" || 
                   user?.role === "lider_infra" || 
                   user?.role === "func_infra" || 
                   user?.role === "lider_sistemas" || 
                   user?.role === "func_sistemas"

  return (
    <div className="min-h-screen max-h-screen overflow-y-scroll bg-gradient-to-br from-gray-50 to-gray-100 p-8 scrollbar-visible">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Olá, {user?.name?.split(" ")[0] || "Usuário"}! 👋
            </h1>
          </div>
        </div>

        {/* Personal Stats for TI Users */}
        {isTIUser && personalStats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Minhas Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Chamados atribuídos */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                    <TicketIcon className="w-6 h-6 text-purple-700" />
                  </div>
                  <Badge className="text-xs bg-purple-200 text-purple-800 border-0">Meus</Badge>
                </div>
                <h3 className="text-3xl font-bold text-purple-900 mb-1">{personalStats.total}</h3>
                <p className="text-sm text-purple-700 font-medium">Chamados atribuídos</p>
              </Card>

              {/* 2. Em andamento */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <Badge className="text-xs bg-blue-200 text-blue-800 border-0">Trabalhando</Badge>
                </div>
                <h3 className="text-3xl font-bold text-blue-900 mb-1">{personalStats.inProgress}</h3>
                <p className="text-sm text-blue-700 font-medium">Em andamento</p>
              </Card>

              {/* 3. Aguardando revisão */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-700" />
                  </div>
                  <Badge className="text-xs bg-orange-200 text-orange-800 border-0">Revisão</Badge>
                </div>
                <h3 className="text-3xl font-bold text-orange-900 mb-1">{personalStats.inReview}</h3>
                <p className="text-sm text-orange-700 font-medium">Aguardando revisão</p>
              </Card>

              {/* 4. Chamados concluídos */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-700" />
                  </div>
                  <Badge className="text-xs bg-green-200 text-green-800 border-0">Resolvidos</Badge>
                </div>
                <h3 className="text-3xl font-bold text-green-900 mb-1">{personalStats.resolved}</h3>
                <p className="text-sm text-green-700 font-medium">Chamados concluídos</p>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <Card className="lg:col-span-2 p-6 bg-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chamados Recentes</h2>
                <p className="text-sm text-gray-600 mt-1">Últimos chamados criados</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/tickets")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Ver todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-scroll pr-2 scrollbar-visible">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-600">Carregando...</p>
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <TicketIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Nenhum chamado ainda</h3>
                  <p className="text-sm text-gray-600 mb-4">Crie seu primeiro chamado para começar</p>
                  <Button onClick={() => router.push("/tickets")} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Chamado
                  </Button>
                </div>
              ) : (
                recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-blue-600">#{ticket.number}</span>
                          <Badge variant="outline" className={`${urgencyColors[ticket.urgency]} text-xs border font-semibold`}>
                            {urgencyLabels[ticket.urgency]}
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {ticket.subject}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(ticket.createdAt)}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions & Notices */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {isAdmin && (
              <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg text-white">
                <h2 className="text-lg font-bold mb-4">Acesso Rápido</h2>
                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => router.push("/ti/kanban")}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Kanban
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => router.push("/ti/metricas")}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Métricas
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => router.push("/ti/usuarios")}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Usuários
                  </Button>
                </div>
              </Card>
            )}

            {/* Notices */}
            <NoticeBoard />
          </div>
        </div>
      </div>
    </div>
  )
}
