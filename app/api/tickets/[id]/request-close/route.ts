import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await context.params
    const ticketId = params.id

    // Buscar o ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: true,
        assignedTo: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar se é TI
    const userTeam = session.user.team
    if (userTeam !== "infra" && userTeam !== "sistemas" && userTeam !== "admin") {
      return NextResponse.json({ error: "Apenas TI pode solicitar finalização" }, { status: 403 })
    }

    // Atualizar status para "Aguardando Aprovação" e kanbanStatus para "review"
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "Aguardando Aprovação",
        kanbanStatus: "review",
        updatedAt: new Date(),
      },
      include: {
        requester: true,
        assignedTo: true,
        messages: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        attachments: {
          include: {
            uploadedBy: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    console.log(`🔄 Ticket ${ticket.number} movido para "Revisão" (aguardando aprovação do usuário)`)

    // Notificar via Socket.IO
    const { notifyTicketUpdate, ensureSocketIO } = require('@/lib/socket-server')
    ensureSocketIO()
    notifyTicketUpdate({
      type: 'ticket_updated',
      ticket: updatedTicket
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Erro ao solicitar finalização:", error)
    return NextResponse.json(
      { error: "Erro ao solicitar finalização do chamado" },
      { status: 500 }
    )
  }
}
