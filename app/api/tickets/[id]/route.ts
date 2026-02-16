import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { notifyTicketUpdate as notifySSE } from "@/app/api/tickets/events/route"

// GET - Buscar chamado específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        messages: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar permissão
    const userId = session.user.id
    const userRole = session.user.role
    
    const canView = 
      userRole === "admin" ||
      ticket.requesterId === userId ||
      ticket.assignedToId === userId ||
      (userRole.includes("lider") && ticket.team === session.user.team) ||
      (userRole.includes("func") && ticket.team === session.user.team)

    if (!canView) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("❌ Erro ao buscar chamado:", error)
    return NextResponse.json({ error: "Erro ao buscar chamado" }, { status: 500 })
  }
}

// PATCH - Atualizar chamado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { status, kanbanStatus, assignedToId, urgency, rating, feedback } = body

    // Buscar o ticket para verificar permissões
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        requesterId: true,
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    const userId = session.user.id
    const userRole = session.user.role
    const isRequester = ticket.requesterId === userId
    const isTIUser = userRole === "admin" || userRole.includes("lider") || userRole.includes("func")

    // Verificar permissões específicas
    if (!isTIUser && !isRequester) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Se for usuário comum, só pode atualizar rating, feedback ou reabrir
    if (isRequester && !isTIUser) {
      const allowedUpdates = ['rating', 'feedback', 'status', 'kanbanStatus']
      const requestedUpdates = Object.keys(body)
      const hasInvalidUpdate = requestedUpdates.some(key => !allowedUpdates.includes(key))
      
      if (hasInvalidUpdate) {
        return NextResponse.json({ error: "Sem permissão para esta atualização" }, { status: 403 })
      }

      // Se está mudando status, só pode reabrir (Aberto)
      if (status && status !== "Aberto") {
        return NextResponse.json({ error: "Usuário só pode reabrir chamados" }, { status: 403 })
      }
    }

    const updateData = {
      ...(status && { status }),
      ...(kanbanStatus && { kanbanStatus }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(urgency && { urgency }),
      ...(rating !== undefined && { rating }),
      ...(feedback !== undefined && { feedback }),
      updatedAt: new Date(),
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Notificar via SSE sobre atualização do ticket
    notifySSE({
      type: 'ticket_updated',
      ticket: updatedTicket
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error)
    return NextResponse.json({ error: "Erro ao atualizar chamado" }, { status: 500 })
  }
}
