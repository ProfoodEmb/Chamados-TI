"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { TicketDetail } from "@/components/ticket-detail"

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
  const ticketId = params.id as string
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

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
  
  return <TicketDetail ticket={ticket} onMessageSent={fetchTicket} />
}
