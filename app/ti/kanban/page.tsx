"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Inbox, PlayCircle, Eye, CheckCircle2, User as UserIcon, Clock } from "lucide-react"
import { mockTickets, type Ticket } from "@/lib/mock-tickets"

interface User {
  id: string
  name: string
  email: string
  role: string
  team: string
}

export default function KanbanPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
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
            // Redirecionar para home se não for autorizado
            window.location.href = "/"
            return
          }
          
          setUser(session.user)
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error)
        window.location.href = "/"
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
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
    
    if (user.role === "lider_infra") {
      return tickets.filter(t => t.team === "infra" || t.team === "automacao")
    }
    
    if (user.role === "lider_sistemas") {
      return tickets.filter(t => t.team === "sistemas" || t.team === "automacao")
    }
    
    if (user.role === "func_infra") {
      return tickets.filter(t => t.assignedTo === user.id)
    }
    
    if (user.role === "func_sistemas") {
      return tickets.filter(t => t.assignedTo === user.id)
    }
    
    return []
  }

  const filteredTickets = getFilteredTickets()

  const inboxTickets = filteredTickets.filter(t => t.kanbanStatus === "inbox")
  const inProgressTickets = filteredTickets.filter(t => t.kanbanStatus === "in_progress")
  const reviewTickets = filteredTickets.filter(t => t.kanbanStatus === "review")
  const doneTickets = filteredTickets.filter(t => t.kanbanStatus === "done")

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className="bg-card border border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer">
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
        <span>{ticket.requester}</span>
      </div>

      {ticket.team && (
        <Badge variant="outline" className="text-xs mb-3">
          {ticket.team === "infra" ? "Infraestrutura" : ticket.team === "sistemas" ? "Sistemas" : "Automação"}
        </Badge>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          {ticket.assignedTo ? (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {ticket.responsible.split(" ").map(n => n[0]).join("").slice(0, 2)}
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
          <span>{ticket.createdAt.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  )

  const KanbanColumn = ({ 
    title, 
    icon: Icon, 
    tickets, 
    color 
  }: { 
    title: string
    icon: any
    tickets: Ticket[]
    color: string
  }) => (
    <div className="flex-1 min-w-[300px]">
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
      
      <div className="bg-muted/30 p-4 min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum chamado
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>
    </div>
  )

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
                    {user.role === "func_infra" && "Meus chamados - Infraestrutura"}
                    {user.role === "func_sistemas" && "Meus chamados - Sistemas"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
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
              <div className="flex gap-4 h-full">
                <KanbanColumn
                  title="Caixa de Entrada"
                  icon={Inbox}
                  tickets={inboxTickets}
                  color="bg-gradient-to-r from-gray-600 to-gray-500"
                />
                
                <KanbanColumn
                  title="Em Andamento"
                  icon={PlayCircle}
                  tickets={inProgressTickets}
                  color="bg-gradient-to-r from-blue-600 to-blue-500"
                />
                
                <KanbanColumn
                  title="Em Revisão"
                  icon={Eye}
                  tickets={reviewTickets}
                  color="bg-gradient-to-r from-yellow-600 to-yellow-500"
                />
                
                <KanbanColumn
                  title="Concluído"
                  icon={CheckCircle2}
                  tickets={doneTickets}
                  color="bg-gradient-to-r from-green-600 to-green-500"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
