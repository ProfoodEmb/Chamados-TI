import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { notifyTicketUpdate, ensureSocketIO } from "@/lib/api/socket-server"
import { notifyTicketCreated } from "@/lib/api/webhook-notifications"

// GET - Listar chamados
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role || "user"
    const userTeam = session.user.team || null

    // Pegar filtro de equipe da query string (para casos específicos)
    const { searchParams } = new URL(request.url)
    const teamFilter = searchParams.get('team')

    // Buscar chamados baseado no role
    let tickets
    
    if (userRole === "admin") {
      // Admin vê todos (ou filtrado por query param)
      const whereClause = teamFilter ? { team: teamFilter } : {}
      tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              setor: true,
              empresa: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (userRole.includes("lider") || userRole.includes("func")) {
      // Equipe T.I. vê chamados da sua equipe (ou filtrado por query param se for admin)
      const teamToFilter = teamFilter || userTeam
      tickets = await prisma.ticket.findMany({
        where: teamToFilter ? {
          OR: [
            { team: teamToFilter },
            { assignedToId: userId }
          ]
        } : {
          assignedToId: userId
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              setor: true,
              empresa: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Usuário comum vê apenas seus chamados
      tickets = await prisma.ticket.findMany({
        where: {
          requesterId: userId
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              setor: true,
              empresa: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Erro ao buscar chamados:", error)
    return NextResponse.json({ error: "Erro ao buscar chamados" }, { status: 500 })
  }
}

// POST - Criar chamado
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, category, urgency, service, anydesk, patrimonio, team } = body

    // Validação básica
    if (!subject || !description || !urgency) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    // Gerar número do chamado sequencial
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        number: true
      }
    })

    let ticketNumber = '000001'
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.number)
      ticketNumber = String(lastNumber + 1).padStart(6, '0')
    }

    // Auto-atribuição: Tickets de Sistemas + Automação vão para Jackson
    let assignedToId = null
    
    // Regra 1: Automação de Sistemas → Jackson
    if (team === 'sistemas' && category === 'Automação') {
      const jackson = await prisma.user.findFirst({
        where: { username: 'lider_infra' },
        select: { id: true }
      })
      
      if (jackson) {
        assignedToId = jackson.id
        console.log('🤖 [Auto-atribuição] Ticket de Automação → Jackson')
      }
    }
    // Regra 2: eCalc → Rafael
    else if (service === 'eCalc' || category === 'eCalc') {
      const rafael = await prisma.user.findFirst({
        where: { username: 'rafael.silva' },
        select: { id: true }
      })
      
      if (rafael) {
        assignedToId = rafael.id
        console.log('🤖 [Auto-atribuição] Ticket de eCalc → Rafael')
      }
    }
    // Regra 3: Questor → Rafael
    else if (service === 'Questor' || category === 'Questor') {
      const rafael = await prisma.user.findFirst({
        where: { username: 'rafael.silva' },
        select: { id: true }
      })
      
      if (rafael) {
        assignedToId = rafael.id
        console.log('🤖 [Auto-atribuição] Ticket de Questor → Rafael')
      }
    }
    // Regra 4: Qualquer outro ticket de Sistemas → Rafael
    else if (team === 'sistemas') {
      const rafael = await prisma.user.findFirst({
        where: { username: 'rafael.silva' },
        select: { id: true }
      })
      
      if (rafael) {
        assignedToId = rafael.id
        console.log('🤖 [Auto-atribuição] Ticket de Sistemas → Rafael')
      }
    }

    // Criar chamado
    const ticket = await prisma.ticket.create({
      data: {
        number: ticketNumber,
        subject,
        description,
        category: category || "Geral",
        urgency,
        status: "Aberto",
        kanbanStatus: "inbox",
        service: service || null,
        anydesk: anydesk || null,
        team: team || null,
        requesterId: session.user.id,
        assignedToId: assignedToId,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            setor: true,
            empresa: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    // Criar mensagem inicial com a descrição
    await prisma.message.create({
      data: {
        content: description,
        role: "user",
        ticketId: ticket.id,
        authorId: session.user.id,
      }
    })

    // Garantir que Socket.IO esteja inicializado
    ensureSocketIO()

    // Notificar via Socket.IO sobre novo ticket
    const notified = notifyTicketUpdate({
      type: 'ticket_created',
      ticket: ticket
    })

    console.log('📢 Notificação Socket.IO enviada:', notified ? 'Sucesso' : 'Falhou')

    // Enviar notificação via webhook (Discord, Slack, etc)
    try {
      await notifyTicketCreated(ticket as any)
    } catch (webhookError) {
      console.error('⚠️  Erro ao enviar webhook (não crítico):', webhookError)
      // Não falhar a criação do ticket se o webhook falhar
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar chamado:", error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}
