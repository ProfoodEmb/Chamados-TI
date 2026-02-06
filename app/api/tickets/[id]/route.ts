import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notifyTicketUpdate, ensureSocketIO } from "@/lib/socket-server"

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
    console.error("Erro ao buscar chamado:", error)
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
    const { status, kanbanStatus, assignedToId, urgency } = body

    console.log('🔄 API PATCH recebeu:', { 
      ticketId: id, 
      status, 
      kanbanStatus, 
      assignedToId, 
      urgency 
    })

    // Apenas equipe T.I. pode atualizar
    const userRole = session.user.role
    if (!userRole.includes("admin") && !userRole.includes("lider") && !userRole.includes("func")) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const updateData = {
      ...(status && { status }),
      ...(kanbanStatus && { kanbanStatus }),
      ...(assignedToId !== undefined && { assignedToId }),
      ...(urgency && { urgency }),
      updatedAt: new Date(),
    }

    console.log('🔄 Dados para atualização:', updateData)

    const ticket = await prisma.ticket.update({
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

    // Garantir que Socket.IO esteja inicializado
    ensureSocketIO()

    // Notificar via Socket.IO sobre atualização do ticket
    const notified = notifyTicketUpdate({
      type: 'ticket_updated',
      ticket: ticket
    })

    console.log('📢 Notificação de atualização enviada:', notified ? 'Sucesso' : 'Falhou')

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error)
    return NextResponse.json({ error: "Erro ao atualizar chamado" }, { status: 500 })
  }
}
