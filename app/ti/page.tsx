"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Clock, CheckCircle2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { useSimplePolling } from "@/lib/use-simple-polling"
import { AssignTicketDialog } from "@/components/assign-ticket-dialog"
import { NoticeBoard } from "@/components/notice-board"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
}

interface Ticket {
  id: string
  number: string
  subject: string
  description?: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  kanbanStatus?: string
  team?: string | null
  service?: string | null
  anydesk?: string | null
  createdAt: string
  updatedAt: string
  requester: {
    id: string
    name: string
    email: string
  }
  assignedTo?: User | null
  assignedToId?: string | null
}

export default function TIPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  // Verificar autorização e buscar tickets
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          const userRole = session.user.role
          const authorized = userRole === "admin" || 
                           userRole === "lider_infra" || 
                           userRole === "func_infra" || 
                           userRole === "lider_sistemas" || 
                           userRole === "func_sistemas"
          
          if (!authorized) {
            window.location.href = "/"
            return
          }
          
          setUser(session.user) // Salvar dados do usuário
          setIsAuthorized(true)
          
          // Buscar tickets
          await fetchTickets()
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        window.location.href = "/"
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

  // Função para abrir diálogo de atribuição
  const handleAssignTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowAssignDialog(true)
  }

  // Função para recarregar tickets após atribuição
  const handleTicketAssigned = () => {
    // O polling vai atualizar automaticamente
    console.log("Ticket atribuído com sucesso!")
  }

  // Sistema de tempo real com polling simples
  const { isActive, lastUpdate, forceUpdate, interval } = useSimplePolling({
    onUpdate: (data) => {
      console.log('Atualização recebida via polling:', data)
      fetchTickets()
    },
    enabled: isAuthorized,
    interval: 8000 // 8 segundos
  })

  // Escutar evento de criação de chamado (fallback)
  useEffect(() => {
    const handleTicketCreated = () => {
      console.log("Evento ticketCreated recebido - atualizando tickets...")
      fetchTickets()
    }

    window.addEventListener('ticketCreated', handleTicketCreated)

    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
    }
  }, [])

  const statusColors = {
    "Aberto": "bg-gray-500",           // Caixa de Entrada - Cinza
    "Em Andamento": "bg-blue-500",     // Em Andamento - Azul
    "Em Revisão": "bg-yellow-500",     // Em Revisão - Amarelo
    "Concluído": "bg-green-500",       // Concluído - Verde
    "Pendente": "bg-yellow-500",
    "Fechado": "bg-gray-500",
    "Resolvido": "bg-green-500",
    "Aguardando Aprovação": "bg-orange-500",
  }

  const urgencyLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  }

  const urgencyColors = {
    low: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  }

  // Estatísticas
  const totalTickets = tickets.length
  const pendingTickets = tickets.filter((t: Ticket) => t.status === "Pendente" || t.status === "Aberto").length
  const resolvedTickets = tickets.filter((t: Ticket) => t.status === "Resolvido").length
  const criticalTickets = tickets.filter((t: Ticket) => t.urgency === "critical").length

  // Filtrar tickets
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch = searchTerm === "" || 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || ticket.urgency === urgencyFilter
    
    return matchesSearch && matchesStatus && matchesUrgency
  })

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

  // Mostrar loading enquanto verifica autorização
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autorizado, não renderiza nada (já foi redirecionado)
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 md:pl-16">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard T.I.</h1>
                  <p className="text-muted-foreground">Gerencie todos os chamados do sistema</p>
                </div>
                
                {/* Indicador de polling */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200">
                    {isActive ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Polling ({interval}s)
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Desconectado</span>
                      </>
                    )}
                    <span className="text-sm text-green-500">({lastUpdate})</span>
                  </div>
                  
                  <button 
                    onClick={forceUpdate}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Atualizar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalTickets}</h3>
                <p className="text-sm text-muted-foreground">Total de Chamados</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{pendingTickets}</h3>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{resolvedTickets}</h3>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{criticalTickets}</h3>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </div>

            {/* Grid - Tabela de Chamados e Mural de Avisos */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              {/* Seção Principal - Filtros e Tabela */}
              <div className="space-y-6">
                {/* Filtros e Ações */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Busca */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por número, assunto ou solicitante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filtro de Status */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Resolvido">Resolvido</SelectItem>
                        <SelectItem value="Fechado">Fechado</SelectItem>
                        <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Filtro de Urgência */}
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas Urgências</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tabela de Chamados */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Número</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Assunto</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Solicitante</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Responsável</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Urgência</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Última Ação</th>
                          <th className="text-left p-4 text-sm font-semibold text-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket: Ticket) => (
                          <tr key={ticket.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <span className="font-mono text-sm font-medium text-foreground">#{ticket.number}</span>
                            </td>
                            <td className="p-4">
                              <div className="max-w-xs">
                                <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                                <p className="text-xs text-muted-foreground">{ticket.category}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-foreground">{ticket.requester.name}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-foreground">{ticket.assignedTo?.name || "Não atribuído"}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={`${urgencyColors[ticket.urgency]} border`}>
                                {urgencyLabels[ticket.urgency]}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={`${statusColors[ticket.status as keyof typeof statusColors]} text-white`}>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `/tickets/${ticket.id}`}
                                >
                                  Ver
                                </Button>
                                {/* Botão Atribuir - apenas para líderes */}
                                {(user?.role === "lider_infra" || user?.role === "lider_sistemas" || user?.role === "admin") && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleAssignTicket(ticket)}
                                  >
                                    Atribuir
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredTickets.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Nenhum chamado encontrado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mural de Avisos */}
              <NoticeBoard />
            </div>
          </div>
        </main>
      </div>

      {/* Diálogo de Atribuição */}
      {user && (
        <AssignTicketDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          ticket={selectedTicket}
          currentUser={user}
          onTicketAssigned={handleTicketAssigned}
        />
      )}
    </div>
  )
}
