import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"

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
    const body = await request.json()
    const { accept } = body // true = aceita finalizar, false = continua aberto

    // Buscar o ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar se é o solicitante
    if (ticket.requesterId !== session.user.id) {
      return NextResponse.json({ error: "Apenas o solicitante pode responder" }, { status: 403 })
    }

    // Atualizar status e kanbanStatus baseado na resposta
    let newStatus, newKanbanStatus;
    
    if (accept) {
      // Usuário aceita: vai para Resolvido (aguardando avaliação)
      newStatus = "Resolvido";
      newKanbanStatus = "review"; // Mantém em review até avaliar
    } else {
      // Usuário nega: volta para Aberto e Em Progresso
      newStatus = "Aberto";
      newKanbanStatus = "in_progress";
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        kanbanStatus: newKanbanStatus,
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

    if (accept) {
      console.log(`✅ Ticket ${ticket.number} aceito pelo usuário - aguardando avaliação`)
    } else {
      console.log(`🔄 Ticket ${ticket.number} negado pelo usuário - voltou para "Em Progresso"`)
    }

    // Notificar via Socket.IO
    const { notifyTicketUpdate, ensureSocketIO } = require('@/lib/api/socket-server')
    ensureSocketIO()
    notifyTicketUpdate({
      type: 'ticket_updated',
      ticket: updatedTicket
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Erro ao responder solicitação:", error)
    return NextResponse.json(
      { error: "Erro ao responder solicitação de finalização" },
      { status: 500 }
    )
  }
}
