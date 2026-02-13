"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { TicketDetail } from "@/components/features/tickets/ticket-detail"
import { useTicketPolling } from "@/lib/use-ticket-polling"
import { Wifi, WifiOff, Clock } from "lucide-react"

interface Ticket {
  id: string
  number: string
  subject: string
  description: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  kanbanStatus: string
  service?: string
  anydesk?: string
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
  messages: Array<{
    id: string
    content: string
    role: "user" | "support"
    createdAt: string
    author: {
      id: string
      name: string
      email: string
    }
  }>
  attachments?: Array<{
    id: string
    filename: string
    url: string
    size: number
    mimeType: string
    createdAt: string
    uploadedBy: {
      id: string
      name: string
    }
  }>
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params?.id as string
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; team: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sistema de polling para mensagens (5 segundos para tempo real)
  const { isActive, lastUpdate, forceUpdate, interval } = useTicketPolling({
    ticketId,
    onUpdate: (updatedTicket) => {
      console.log('💬 Ticket atualizado via polling:', updatedTicket)
      setTicket(updatedTicket)
      setIsLoading(false)
    },
    enabled: !!ticketId,
    interval: 5000 // 5 segundos para atualização em tempo real
  })

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
      fetchCurrentUser()
    }
  }, [ticketId])

  // Escutar eventos de atualização de ticket
  useEffect(() => {
    const handleTicketUpdated = (event: any) => {
      console.log('🔔 Evento ticketUpdated recebido:', event.detail)
      // Forçar atualização imediata
      fetchTicket()
      forceUpdate()
    }

    window.addEventListener('ticketUpdated', handleTicketUpdated)

    return () => {
      window.removeEventListener('ticketUpdated', handleTicketUpdated)
    }
  }, [ticketId])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/get-session')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser({
          id: data.user.id,
          team: data.user.team,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    }
  }

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else if (response.status === 404) {
        setError("Chamado não encontrado")
      } else if (response.status === 403) {
        setError("Você não tem permissão para ver este chamado")
      } else {
        setError("Erro ao carregar chamado")
      }
    } catch (error) {
      console.error("Erro ao buscar chamado:", error)
      setError("Erro ao carregar chamado")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando chamado...</p>
        </div>
      </div>
    )
  }
  
  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{error || "Chamado não encontrado"}</p>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Indicador de tempo real para chat */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chat em Tempo Real</span>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${
              isActive 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {isActive ? (
                <>
                  <Wifi className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    Atualização Automática ({interval}s)
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">Desconectado</span>
                </>
              )}
              <span className={`text-xs ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                ({lastUpdate})
              </span>
            </div>
          </div>
          
          <button 
            onClick={forceUpdate}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-blue-600">Atualizar</span>
          </button>
        </div>
      </div>
      
      {/* Componente de ticket */}
      <div className="flex-1 min-h-0">
        <TicketDetail ticket={ticket} onMessageSent={forceUpdate} currentUser={currentUser || undefined} />
      </div>
    </div>
  )
}
