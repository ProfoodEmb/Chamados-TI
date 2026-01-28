import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

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
    const userRole = session.user.role

    // Buscar chamados baseado no role
    let tickets
    
    if (userRole === "admin") {
      // Admin vê todos
      tickets = await prisma.ticket.findMany({
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
      // Equipe T.I. vê chamados da sua equipe
      const userTeam = session.user.team
      tickets = await prisma.ticket.findMany({
        where: {
          OR: [
            { team: userTeam },
            { assignedToId: userId }
          ]
        },
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

    // Gerar número do chamado (timestamp + random)
    const ticketNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`

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
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar chamado:", error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}
