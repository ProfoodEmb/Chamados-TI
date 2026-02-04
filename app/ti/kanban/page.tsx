"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Inbox, PlayCircle, Eye, CheckCircle2, User as UserIcon, Clock, Wifi, WifiOff } from "lucide-react"
import { KanbanTicketModal } from "@/components/kanban-ticket-modal"
import { useSimplePolling } from "@/lib/use-simple-polling"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // Sistema de tempo real com polling simples
  const { isActive, lastUpdate, forceUpdate, interval } = useSimplePolling({
    onUpdate: (data) => {
      console.log('Atualização recebida via polling:', data)
      fetchTickets()
    },
    enabled: isAuthorized && !!user,
    interval: 8000 // 8 segundos
  })

  // Escutar evento de criação de chamado (fallback)
  useEffect(() => {
    const handleTicketCreated = () => {
      console.log("Evento ticketCreated recebido no Kanban - atualizando tickets...")
      fetchTickets()
    }

    window.addEventListener('ticketCreated', handleTicketCreated)

    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
    }
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

  // Filtrar tickets baseado na permissão do usuário
  const getFilteredTickets = () => {
    if (!user) return []
    
    if (user.role === "admin") {
      return tickets
    }
    
    if (user.role === "lider_infra" || user.role === "func_infra") {
      return tickets.filter((t: Ticket) => t.team === "infra" || t.team === "automacao")
    }
    
    if (user.role === "lider_sistemas" || user.role === "func_sistemas") {
      return tickets.filter((t: Ticket) => t.team === "sistemas" || t.team === "automacao")
    }
    
    return []
  }

  const filteredTickets = getFilteredTickets()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const inboxTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "inbox")
  const inProgressTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "in_progress")
  const reviewTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "review")
  const doneTickets = filteredTickets.filter((t: Ticket) => t.kanbanStatus === "done")

  // Função para atualizar ticket
  const updateTicket = async (ticketId: string, updates: any) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        // Atualizar o estado local
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, ...updates }
              : ticket
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error)
    }
  }

  // Handlers do drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const ticket = filteredTickets.find(t => t.id === active.id)
    setActiveTicket(ticket || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)

    if (!over) return

    const ticketId = active.id as string
    const newStatus = over.id as string

    // Mapear IDs das colunas para status do kanban
    const statusMap: Record<string, string> = {
      'inbox': 'inbox',
      'in_progress': 'in_progress',
      'review': 'review',
      'done': 'done',
    }

    const kanbanStatus = statusMap[newStatus]
    if (kanbanStatus) {
      updateTicket(ticketId, { kanbanStatus })
    }
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: ticket.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const handleCardClick = (e: React.MouseEvent) => {
      // Só abre o modal se não estiver arrastando
      if (!isDragging) {
        e.stopPropagation()
        setSelectedTicket(ticket)
        setShowTicketDetail(true)
      }
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-card border border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">#{ticket.number}</span>
          <Badge variant="outline" className={`${urgencyColors[ticket.urgency]} text-xs border`}>
            {urgencyLabels[ticket.urgency]}
          </Badge>
        </div>
        
        <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
          {ticket.subject}
        </h4>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <UserIcon className="w-3 h-3" />
          <span>{ticket.requester.name}</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {ticket.assignedTo ? (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {ticket.assignedTo.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
      </div>
    )
  }

  const KanbanColumn = ({ 
    title, 
    icon: Icon, 
    tickets, 
    color,
    id
  }: { 
    title: string
    icon: any
    tickets: Ticket[]
    color: string
    id: string
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
      <div className="flex-1 min-w-75">
        <div className={`${color} rounded-t-lg p-4 border-b-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {tickets.length}
            </Badge>
          </div>
        </div>
        
        <div 
          ref={setNodeRef}
          className={`bg-muted/30 p-4 min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] overflow-y-auto transition-colors ${
            isOver ? 'bg-muted/50' : ''
          }`}
        >
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {isOver ? 'Solte aqui' : 'Nenhum chamado'}
              </div>
            ) : (
              tickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    )
  }

  if (isLoading) {
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
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Quadro Kanban</h1>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "admin" && "Visualizando todos os chamados"}
                    {user.role === "lider_infra" && "Equipe de Infraestrutura"}
                    {user.role === "lider_sistemas" && "Equipe de Sistemas"}
                    {user.role === "func_infra" && "Equipe de Infraestrutura"}
                    {user.role === "func_sistemas" && "Equipe de Sistemas"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Indicador de polling */}
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                    {isActive ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600">
                          Polling ({interval}s)
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-600">Desconectado</span>
                      </>
                    )}
                    <span className="text-xs text-green-500">({lastUpdate})</span>
                  </div>
                  
                  <button 
                    onClick={forceUpdate}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Atualizar</span>
                  </button>
                  
                  <Button variant="outline" size="sm">
                    Filtros
                  </Button>
                  <Button size="sm">
                    Novo Chamado
                  </Button>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto p-6">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-4 h-full">
                  <KanbanColumn
                    id="inbox"
                    title="Caixa de Entrada"
                    icon={Inbox}
                    tickets={inboxTickets}
                    color="bg-gradient-to-r from-gray-600 to-gray-500"
                  />
                  
                  <KanbanColumn
                    id="in_progress"
                    title="Em Andamento"
                    icon={PlayCircle}
                    tickets={inProgressTickets}
                    color="bg-gradient-to-r from-blue-600 to-blue-500"
                  />
                  
                  <KanbanColumn
                    id="review"
                    title="Em Revisão"
                    icon={Eye}
                    tickets={reviewTickets}
                    color="bg-gradient-to-r from-yellow-600 to-yellow-500"
                  />
                  
                  <KanbanColumn
                    id="done"
                    title="Concluído"
                    icon={CheckCircle2}
                    tickets={doneTickets}
                    color="bg-gradient-to-r from-green-600 to-green-500"
                  />
                </div>

                <DragOverlay>
                  {activeTicket ? <TicketCard ticket={activeTicket} /> : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </main>
      </div>

      {/* Dialog de detalhes do chamado */}
      <Dialog open={showTicketDetail} onOpenChange={setShowTicketDetail}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
          {selectedTicket && (
            <KanbanTicketModal
              ticket={selectedTicket}
              onClose={() => setShowTicketDetail(false)}
              onUpdate={updateTicket}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
