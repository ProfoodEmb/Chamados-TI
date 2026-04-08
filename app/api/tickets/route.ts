import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { notifyTicketCreated } from "@/lib/api/webhook-notifications"
import { notifyTicketCreatedWhatsApp } from "@/lib/api/whatsapp-notifications"

const ticketRequesterSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  setor: true,
  empresa: true,
} as const

const ticketAssigneeSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const

const ticketSummarySelect = {
  id: true,
  number: true,
  subject: true,
  category: true,
  urgency: true,
  status: true,
  kanbanStatus: true,
  team: true,
  service: true,
  anydesk: true,
  customRequesterName: true,
  createdAt: true,
  updatedAt: true,
  requesterId: true,
  assignedToId: true,
  requester: {
    select: ticketRequesterSelect,
  },
  assignedTo: {
    select: ticketAssigneeSelect,
  },
} as const

const ticketListInclude = {
  requester: {
    select: ticketRequesterSelect,
  },
  assignedTo: {
    select: ticketAssigneeSelect,
  },
  messages: {
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
  },
} as const

const CUSTOM_REQUESTER_ID = "__custom_requester__"

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
    const useSummaryView = searchParams.get("view") !== "full"

    // Buscar chamados baseado no role
    let tickets
    
    if (userRole === "admin") {
      // Admin vê todos (ou filtrado por query param)
      const whereClause = teamFilter ? { team: teamFilter } : {}
      tickets = useSummaryView
        ? await prisma.ticket.findMany({
            where: whereClause,
            select: ticketSummarySelect,
            orderBy: {
              createdAt: 'desc'
            }
          })
        : await prisma.ticket.findMany({
            where: whereClause,
            include: ticketListInclude,
            orderBy: {
              createdAt: 'desc'
            }
          })
    } else if (userRole.includes("lider") || userRole.includes("func")) {
      // Equipe T.I. vê chamados da sua equipe (ou filtrado por query param se for admin)
      const teamToFilter = teamFilter || userTeam
      const whereClause = teamToFilter ? {
        OR: [
          { team: teamToFilter },
          { assignedToId: userId }
        ]
      } : {
        assignedToId: userId
      }
      tickets = useSummaryView
        ? await prisma.ticket.findMany({
            where: whereClause,
            select: ticketSummarySelect,
            orderBy: {
              createdAt: 'desc'
            }
          })
        : await prisma.ticket.findMany({
            where: whereClause,
            include: ticketListInclude,
            orderBy: {
              createdAt: 'desc'
            }
          })
    } else {
      // Usuário comum vê apenas seus chamados
      tickets = useSummaryView
        ? await prisma.ticket.findMany({
            where: {
              requesterId: userId
            },
            select: ticketSummarySelect,
            orderBy: {
              createdAt: 'desc'
            }
          })
        : await prisma.ticket.findMany({
            where: {
              requesterId: userId
            },
            include: ticketListInclude,
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
    const { subject, description, category, urgency, service, anydesk, patrimonio, team, requesterId, customRequesterName, solution } = body

    // Validação básica
    if (!subject || !description || !urgency) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    // Determinar quem é o solicitante
    // Se requesterId foi fornecido e o usuário é líder, usar o requesterId
    // Caso contrário, usar o próprio usuário logado
    let finalRequesterId = session.user.id
    const userRole = session.user.role || "user"
    let isCustomRequester = false
    let finalCustomRequesterName = null
    const normalizedCustomRequesterName = customRequesterName?.trim() || null
    
    if (requesterId && (userRole.includes("lider") || userRole === "admin")) {
      if (requesterId === CUSTOM_REQUESTER_ID) {
        if (!normalizedCustomRequesterName) {
          return NextResponse.json(
            { error: "Nome do solicitante é obrigatório" },
            { status: 400 }
          )
        }

        isCustomRequester = true
        finalCustomRequesterName = normalizedCustomRequesterName
      } else if (requesterId !== "self") {
        const requesterExists = await prisma.user.findUnique({
          where: { id: requesterId }
        })
        
        if (requesterExists) {
          finalRequesterId = requesterId
        } else {
          return NextResponse.json({ error: "Usuário solicitante não encontrado" }, { status: 400 })
        }
      }
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

    // Auto-atribuição de tickets
    let assignedToId = null
    
    // Regra 1: Automação → Jackson (Dog King, Ploomes, The Best Açaí)
    if ((team === 'sistemas' && category === 'Automação') || 
        (team === 'sistemas' && service && ['Dog King', 'Ploomes', 'The Best Açaí'].includes(service))) {
      const jackson = await prisma.user.findFirst({
        where: { username: 'lider_infra' },
        select: { id: true }
      })
      
      if (jackson) {
        assignedToId = jackson.id
      }
    }
    // Regra 2: eCalc → Rafael
    else if (service === 'Ecalc' || service === 'eCalc' || category === 'eCalc') {
      const rafael = await prisma.user.findFirst({
        where: { username: 'rafael.silva' },
        select: { id: true }
      })
      
      if (rafael) {
        assignedToId = rafael.id
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
      }
    }
    // Demais tickets de Sistemas ficam sem atribuição automática

    // Criar chamado
    const ticket = await prisma.ticket.create({
      data: {
        number: ticketNumber,
        subject,
        description,
        category: category || "Geral",
        urgency,
        status: isCustomRequester ? "Resolvido" : "Aberto", // Se for customizado, já criar como Resolvido
        kanbanStatus: isCustomRequester ? "done" : "inbox", // Se for customizado, já colocar em done
        service: service || null,
        anydesk: anydesk || null,
        team: team || null,
        requesterId: finalRequesterId,
        assignedToId: assignedToId,
        customRequesterName: finalCustomRequesterName,
        solution: isCustomRequester && solution ? solution : null,
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
        authorId: finalRequesterId,
      }
    })

    // Enviar notificações de forma assíncrona (não bloquear a resposta)
    // Isso garante que o ticket seja criado rapidamente
    Promise.allSettled([
      notifyTicketCreated(ticket as any),
      notifyTicketCreatedWhatsApp(ticket as any)
    ]).then(results => {
      results.forEach((result, index) => {
        const type = index === 0 ? 'Webhook' : 'WhatsApp'
        if (result.status === 'rejected') {
          console.error(`⚠️  Erro ao enviar ${type}:`, result.reason)
        }
      })
    }).catch(error => {
      console.error('⚠️  Erro inesperado nas notificações:', error)
    })

    // Retornar imediatamente sem esperar as notificações
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar chamado:", error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}
