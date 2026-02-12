"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { notifyTicketUpdate, ensureSocketIO } from "@/lib/api/socket-server"
import { notifyTicketCreated } from "@/lib/api/webhook-notifications"
import { notifyTicketCreatedWhatsApp } from "@/lib/api/whatsapp-notifications"
import { revalidatePath } from "next/cache"

// Tipos
interface CreateTicketInput {
  subject: string
  description: string
  category?: string
  urgency: string
  service?: string
  anydesk?: string
  patrimonio?: string
  team?: string
}

interface UpdateTicketInput {
  id: string
  status?: string
  assignedToId?: string
  kanbanStatus?: string
}

// Listar chamados
export async function getTickets(teamFilter?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userId = session.user.id
    const userRole = session.user.role || "user"
    const userTeam = session.user.team || null

    let tickets

    if (userRole === "admin") {
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

    return { success: true, data: tickets }
  } catch (error) {
    console.error("Erro ao buscar chamados:", error)
    return { success: false, error: "Erro ao buscar chamados" }
  }
}

// Criar chamado
export async function createTicket(input: CreateTicketInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const { subject, description, category, urgency, service, anydesk, patrimonio, team } = input

    // Validação básica
    if (!subject || !description || !urgency) {
      return { success: false, error: "Campos obrigatórios faltando" }
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
        console.log('🤖 [Auto-atribuição] Ticket de Automação → Jackson')
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
    // Demais tickets de Sistemas ficam sem atribuição automática

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

    // Enviar notificações de forma assíncrona (não bloquear a resposta)
    Promise.allSettled([
      notifyTicketCreated(ticket as any),
      notifyTicketCreatedWhatsApp(ticket as any)
    ]).then(results => {
      results.forEach((result, index) => {
        const type = index === 0 ? 'Webhook' : 'WhatsApp'
        if (result.status === 'rejected') {
          console.error(`⚠️  Erro ao enviar ${type}:`, result.reason)
        } else {
          console.log(`✅ ${type} enviado com sucesso`)
        }
      })
    }).catch(error => {
      console.error('⚠️  Erro inesperado nas notificações:', error)
    })

    // Revalidar cache
    revalidatePath('/tickets')
    revalidatePath('/ti/kanban')

    return { success: true, data: ticket }
  } catch (error) {
    console.error("Erro ao criar chamado:", error)
    return { success: false, error: "Erro ao criar chamado" }
  }
}

// Buscar chamado por ID
export async function getTicketById(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!ticket) {
      return { success: false, error: "Chamado não encontrado" }
    }

    return { success: true, data: ticket }
  } catch (error) {
    console.error("Erro ao buscar chamado:", error)
    return { success: false, error: "Erro ao buscar chamado" }
  }
}

// Atualizar chamado
export async function updateTicket(input: UpdateTicketInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const { id, ...updateData } = input

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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

    // Notificar via Socket.IO
    ensureSocketIO()
    notifyTicketUpdate({
      type: 'ticket_updated',
      ticket: ticket
    })

    // Revalidar cache
    revalidatePath('/tickets')
    revalidatePath(`/tickets/${id}`)
    revalidatePath('/ti/kanban')

    return { success: true, data: ticket }
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error)
    return { success: false, error: "Erro ao atualizar chamado" }
  }
}
