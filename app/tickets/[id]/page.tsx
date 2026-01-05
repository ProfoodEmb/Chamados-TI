"use client"

import { useParams } from "next/navigation"
import { TicketDetail } from "@/components/ticket-detail"
import { mockTickets } from "@/lib/mock-tickets"

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  
  const ticket = mockTickets.find(t => t.id === ticketId)
  
  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chamado não encontrado</p>
      </div>
    )
  }
  
  return <TicketDetail ticket={ticket} />
}
