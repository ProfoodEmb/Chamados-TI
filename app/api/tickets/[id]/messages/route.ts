import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { notifyTicketUpdate, ensureSocketIO } from "@/lib/api/socket-server"

// POST - Criar mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
    }

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar se o ticket está fechado ou resolvido
    if (ticket.status === "Fechado" || ticket.status === "Resolvido") {
      return NextResponse.json({ error: "Não é possível enviar mensagens em chamados fechados ou resolvidos" }, { status: 400 })
    }

    // Determinar o role da mensagem
    const userRole = session.user.role
    const messageRole = (userRole === "admin" || userRole.includes("lider") || userRole.includes("func")) 
      ? "support" 
      : "user"

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        role: messageRole,
        ticketId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Atualizar kanbanStatus automaticamente
    // Se é a primeira mensagem do suporte, mover para "in_progress"
    if (messageRole === "support" && ticket.kanbanStatus === "inbox") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { kanbanStatus: "in_progress" }
      })
      console.log(`🔄 Ticket ${ticket.number} movido para "Em Progresso" (primeira resposta do suporte)`)
    }

    // Garantir que Socket.IO esteja inicializado
    ensureSocketIO()

    // Notificar sobre nova mensagem E atualização do ticket
    notifyTicketUpdate({
      type: 'message_created',
      ticketId,
      message: message
    })

    // Se mudou o kanbanStatus, notificar também sobre atualização do ticket
    if (messageRole === "support" && ticket.kanbanStatus === "inbox") {
      notifyTicketUpdate({
        type: 'ticket_updated',
        ticketId
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar mensagem:", error)
    return NextResponse.json({ error: "Erro ao criar mensagem" }, { status: 500 })
  }
}
