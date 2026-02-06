"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Inbox, PlayCircle, Eye, CheckCircle2, User as UserIcon, Clock } from "lucide-react"
import { DroppableColumn } from "@/components/kanban-droppable-column"
import { KanbanTicketModal } from "@/components/kanban-ticket-modal"
import { useSimplePolling } from "@/lib/use-simple-polling"

import { KanbanFilters } from "@/components/kanban-filters"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface User {
  id: string
  name: string
  email: string
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
  kanbanStatus: string
  createdAt: string
  updatedAt: string
  team: string | null
  service?: string | null
  anydesk?: string | null
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
  assignedToId: string | null
}

export default function KanbanPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState("") // Será definido baseado no usuário
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  )

  // Sistema de tempo real com polling otimizado
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [pollingStatus, setPollingStatus] = useState<'connecting' | 'active' | 'error'>('connecting')

  // Polling otimizado - intervalo maior para reduzir carga
  const { forceUpdate, isActive, lastUpdate, interval } = useSimplePolling({
    enabled: isAuthorized && !!user,
    interval: 15000, // 15 segundos em vez de 10
    onUpdate: (data) => {
      if (data.type === 'force_update' || data.hasChanges) {
        console.log('🔄 Polling detectou mudanças - atualizando tickets...')
        fetchTickets()
      } else {
        console.log('✅ Polling ativo - sem mudanças detectadas')
      }
    }
  })

  // Atualizar status do polling
  useEffect(() => {
    if (isActive) {
      setPollingStatus('active')
    } else if (isAuthorized && !!user) {
      setPollingStatus('connecting')
    }
  }, [isActive, isAuthorized, user])

  // Função otimizada para buscar tickets
  const fetchTickets = async () => {
    if (!user || isLoadingTickets) return // Evitar múltiplas chamadas simultâneas
    
    setIsLoadingTickets(true)
    setPollingStatus('connecting')
    
    try {
      const response = await fetch('/api/tickets', {
        headers: {
          'Cache-Control': 'no-cache', // Evitar cache desnecessário
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
        setPollingStatus('active')
        console.log('✅ Tickets atualizados via API:', data.length, 'tickets')
      } else {
        setPollingStatus('error')
        console.error('❌ Erro ao carregar tickets:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar tickets:', error)
      setPollingStatus('error')
    } finally {
      setIsLoadingTickets(false)
    }
  }

  // Buscar tickets quando usuário estiver disponível
  useEffect(() => {
    if (user && isAuthorized) {
      fetchTickets()
    }
  }, [user, isAuthorized])

  const updateTicketLocally = (ticketId: string, updates: any) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ))
  }

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
          
          setUser(session.user)
          setIsAuthorized(true)
          
          // Definir filtro padrão baseado na equipe do usuário
          if (session.user.role === "lider_infra" || session.user.role === "func_infra") {
            setTeamFilter("infra")
          } else if (session.user.role === "lider_sistemas" || session.user.role === "func_sistemas") {
            setTeamFilter("sistemas")
          } else {
            // Admin vê todos por padrão
            setTeamFilter("all")
          }
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

  const urgencyColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    critical: "bg-red-100 text-red-700 border-red-300",
  }

  const urgencyLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  }

  // Filtrar tickets baseado nos filtros aplicados
  const getFilteredTickets = () => {
    if (!user || !tickets) return []
    
    let filtered = tickets

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((t: Ticket) => 
        t.number.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.requester.name.toLowerCase().includes(search)
      )
    }

    // Filtro por equipe
    if (teamFilter !== "all") {
      filtered = filtered.filter((t: Ticket) => t.team === teamFilter)
    }

    // Filtro por urgência
    if (urgencyFilter !== "all") {
      filtered = filtered.filter((t: Ticket) => t.urgency === urgencyFilter)
    }

    // Filtro por responsável
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        filtered = filtered.filter((t: Ticket) => !t.assignedToId)
      } else if (assigneeFilter === "jackson") {
        filtered = filtered.filter((t: Ticket) => 
          t.assignedTo?.name.toLowerCase().includes("jackson")
        )
      } else if (assigneeFilter === "gustavo") {
        filtered = filtered.filter((t: Ticket) => 
          t.assignedTo?.name.toLowerCase().includes("gustavo")
        )
      } else if (assigneeFilter === "danilo") {
        filtered = filtered.filter((t: Ticket) => 
          t.assignedTo?.name.toLowerCase().includes("danilo")
        )
      } else if (assigneeFilter === "antony") {
        filtered = filtered.filter((t: Ticket) => 
          t.assignedTo?.name.toLowerCase().includes("antony")
        )
      } else if (assigneeFilter === "rafael") {
        filtered = filtered.filter((t: Ticket) => 
          t.assignedTo?.name.toLowerCase().includes("rafael")
        )
      }
    }

    // Filtro por data
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((t: Ticket) => {
        const ticketDate = new Date(t.createdAt)
        
        switch (dateFilter) {
          case "today":
            return ticketDate >= today
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return ticketDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return ticketDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filtro por categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t: Ticket) => t.category === categoryFilter)
    }
    
    return filtered
  }

  const filteredTickets = getFilteredTickets()

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (teamFilter !== "all") count++
    if (urgencyFilter !== "all") count++
    if (assigneeFilter !== "all") count++
    if (dateFilter !== "all") count++
    if (categoryFilter !== "all") count++
    return count
  }

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm("")
    // Resetar filtro de equipe baseado no usuário
    if (user?.role === "lider_infra" || user?.role === "func_infra") {
      setTeamFilter("infra")
    } else if (user?.role === "lider_sistemas" || user?.role === "func_sistemas") {
      setTeamFilter("sistemas")
    } else {
      setTeamFilter("all")
    }
    setUrgencyFilter("all")
    setAssigneeFilter("all")
    setDateFilter("all")
    setCategoryFilter("all")
  }

  // Memoizar as listas de tickets por coluna para evitar recálculos
  const inboxTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "inbox")
  const inProgressTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "in_progress")
  const reviewTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "review")
  const doneTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "done")

  // Função otimizada para formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  // Função para atualizar ticket com debounce para evitar muitas chamadas
  const updateTicket = async (ticketId: string, updates: any) => {
    try {
      console.log(`🔄 Atualizando ticket ${ticketId}:`, updates)
      
      // Atualizar estado local imediatamente (optimistic update)
      updateTicketLocally(ticketId, updates)

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        console.error('❌ Erro ao atualizar ticket na API')
        // Reverter mudança em caso de erro
        setTimeout(() => forceUpdate(), 1000) // Delay para evitar spam
      } else {
        console.log('✅ Ticket atualizado com sucesso')
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket:', error)
      // Reverter mudança em caso de erro
      setTimeout(() => forceUpdate(), 1000)
    }
  }

  // Handlers do drag and drop melhorados
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const ticket = filteredTickets.find((t: Ticket) => t.id === active.id)
    setActiveTicket(ticket || null)
    setIsDragging(true)
    console.log('🎯 Iniciando drag:', ticket?.number)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Opcional: feedback visual durante o drag
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)
    setIsDragging(false)

    if (!over) {
      console.log('❌ Drag cancelado - sem destino válido')
      return
    }

    const ticketId = active.id as string
    const newColumnId = over.id as string

    console.log(`📦 Movendo ticket ${ticketId} para coluna ${newColumnId}`)

    // Mapear IDs das colunas para status do kanban E status do sistema
    const statusMap: Record<string, { kanbanStatus: string; systemStatus: string }> = {
      'inbox': { 
        kanbanStatus: 'inbox', 
        systemStatus: 'Aberto' 
      },
      'in_progress': { 
        kanbanStatus: 'in_progress', 
        systemStatus: 'Em Andamento' 
      },
      'review': { 
        kanbanStatus: 'review', 
        systemStatus: 'Em Revisão' 
      },
      'done': { 
        kanbanStatus: 'done', 
        systemStatus: 'Concluído' 
      },
    }

    const newStatuses = statusMap[newColumnId]
    
    if (!newStatuses) {
      console.log('❌ Status inválido:', newColumnId)
      return
    }

    // Verificar se realmente mudou de coluna
    const currentTicket = filteredTickets.find((t: Ticket) => t.id === ticketId)
    if (currentTicket?.kanbanStatus === newStatuses.kanbanStatus) {
      console.log('ℹ️ Ticket já está na coluna correta')
      return
    }

    console.log(`🔄 Atualizando ticket:`, {
      ticketId,
      kanbanStatus: newStatuses.kanbanStatus,
      status: newStatuses.systemStatus,
      currentTicket: currentTicket?.status
    })

    // Atualizar tanto o kanbanStatus quanto o status do sistema
    updateTicket(ticketId, { 
      kanbanStatus: newStatuses.kanbanStatus,
      status: newStatuses.systemStatus
    })
  }

  // Componente TicketCard otimizado com React.memo
  const TicketCard = ({ ticket, isOverlay = false }: { ticket: Ticket; isOverlay?: boolean }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({ 
      id: ticket.id,
      disabled: isOverlay
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isSortableDragging ? 0.5 : 1,
      cursor: isDragging ? 'grabbing' : 'grab',
    }

    const handleCardClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setSelectedTicket(ticket)
      setShowTicketDetail(true)
    }

    // Memoizar valores computados
    const urgencyClass = urgencyColors[ticket.urgency]
    const urgencyText = urgencyLabels[ticket.urgency]
    const formattedDate = formatDate(ticket.createdAt)
    const userInitials = ticket.assignedTo?.name.split(" ").map(n => n[0]).join("").slice(0, 2)
    const firstName = ticket.assignedTo?.name.split(" ")[0]

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm
          hover:shadow-md transition-all duration-200
          ${isDragging || isSortableDragging ? 'shadow-lg scale-105 rotate-1' : ''}
          ${isOverlay ? 'shadow-2xl border-blue-500 bg-blue-50' : ''}
        `}
      >
        {/* Header com Drag Handle */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
              #{ticket.number}
            </span>
            {/* Drag Handle otimizado */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
              title="Arrastar ticket"
            >
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`${urgencyClass} text-[10px] border px-1 py-0`}>
            {urgencyText}
          </Badge>
        </div>
        
        {/* Conteúdo - Completamente clicável */}
        <div 
          className="space-y-2 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
          onClick={handleCardClick}
        >
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {ticket.subject}
          </h4>
          
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <UserIcon className="w-3 h-3 shrink-0" />
            <span className="text-gray-500">Solicitado por:</span>
            <span className="truncate font-medium">{ticket.requester.name}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {ticket.assignedTo ? (
                <div className="flex items-center gap-1">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-blue-500 text-white text-[10px]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">Responsável:</span>
                  <span className="text-xs text-gray-900 font-medium truncate max-w-14">
                    {firstName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-2.5 h-2.5 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500">Responsável:</span>
                  <span className="text-xs text-gray-400">Não atribuído</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }



  if (isLoading || isLoadingTickets) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden pt-16 md:pl-16">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Quadro Kanban</h1>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "admin" && "Visualizando todos os chamados"}
                    {user.role === "lider_infra" && "Equipe de Infraestrutura"}
                    {user.role === "lider_sistemas" && "Equipe de Sistemas"}
                    {user.role === "func_infra" && "Equipe de Infraestrutura"}
                    {user.role === "func_sistemas" && "Equipe de Sistemas"}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Indicador de Status do Sistema */}
                  <div className="flex items-center gap-2 text-xs">
                    {pollingStatus === 'active' && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600">Polling ({interval}s)</span>
                        <span className="text-gray-500">• {lastUpdate}</span>
                      </>
                    )}
                    {pollingStatus === 'connecting' && (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Conectando...</span>
                      </>
                    )}
                    {pollingStatus === 'error' && (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-600">Erro de conexão</span>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('🔄 Atualização manual solicitada')
                      forceUpdate()
                    }}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros Avançados */}
            <div className="px-4">
              <KanbanFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                teamFilter={teamFilter}
                onTeamFilterChange={setTeamFilter}
                urgencyFilter={urgencyFilter}
                onUrgencyFilterChange={setUrgencyFilter}
                assigneeFilter={assigneeFilter}
                onAssigneeFilterChange={setAssigneeFilter}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                users={[]}
                onClearFilters={clearAllFilters}
                activeFiltersCount={getActiveFiltersCount()}
              />
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden p-4">
              <div className="h-full">
                {/* Kanban Columns */}
                <div className="h-full">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="grid grid-cols-4 gap-4 h-full pb-4">
                      <DroppableColumn
                        id="inbox"
                        title="Caixa de Entrada"
                        icon={Inbox}
                        tickets={inboxTickets}
                        color="bg-gradient-to-r from-gray-600 to-gray-500"
                      >
                        {inboxTickets.map((ticket: Ticket) => (
                          <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                      </DroppableColumn>
                      
                      <DroppableColumn
                        id="in_progress"
                        title="Em Andamento"
                        icon={PlayCircle}
                        tickets={inProgressTickets}
                        color="bg-gradient-to-r from-blue-600 to-blue-500"
                      >
                        {inProgressTickets.map((ticket: Ticket) => (
                          <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                      </DroppableColumn>
                      
                      <DroppableColumn
                        id="review"
                        title="Em Revisão"
                        icon={Eye}
                        tickets={reviewTickets}
                        color="bg-gradient-to-r from-orange-600 to-orange-500"
                      >
                        {reviewTickets.map((ticket: Ticket) => (
                          <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                      </DroppableColumn>
                      
                      <DroppableColumn
                        id="done"
                        title="Concluído"
                        icon={CheckCircle2}
                        tickets={doneTickets}
                        color="bg-gradient-to-r from-green-600 to-green-500"
                      >
                        {doneTickets.map((ticket: Ticket) => (
                          <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                      </DroppableColumn>
                    </div>

                    <DragOverlay>
                      {activeTicket ? (
                        <div className="rotate-3 scale-105 shadow-2xl">
                          <TicketCard ticket={activeTicket} isOverlay={true} />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de detalhes do chamado */}
      {showTicketDetail && selectedTicket && (
        <KanbanTicketModal
          ticket={selectedTicket}
          onClose={() => setShowTicketDetail(false)}
          onUpdate={updateTicket}
        />
      )}

    </div>
  )
}
