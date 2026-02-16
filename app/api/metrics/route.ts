import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  try {
    console.log('📊 [API Metrics] Buscando métricas...')

    // Pegar os filtros da query string
    const { searchParams } = new URL(request.url)
    const teamFilter = searchParams.get('team')
    const periodFilter = searchParams.get('period') || '90d'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    // Criar filtro base para equipe
    const teamWhereClause = teamFilter && teamFilter !== 'all' 
      ? { team: teamFilter } 
      : {}

    console.log('📊 [API Metrics] Filtro de equipe:', teamFilter || 'all')
    console.log('📊 [API Metrics] Período:', periodFilter)
    if (customStartDate && customEndDate) {
      console.log('📊 [API Metrics] Datas personalizadas:', customStartDate, 'até', customEndDate)
    }

    // Buscar IDs dos usuários do time específico (para filtrar avaliações e performance)
    let teamUserIds: string[] = []
    if (teamFilter && teamFilter !== 'all') {
      const teamUsers = await prisma.user.findMany({
        where: { team: teamFilter },
        select: { id: true, name: true }
      })
      teamUserIds = teamUsers.map(u => u.id)
      console.log('📊 [API Metrics] Usuários do time:', teamFilter, teamUsers.map(u => u.name))
    }

    // Datas para cálculos baseadas no período ou datas personalizadas
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    // Calcular data de início baseada no período ou usar datas personalizadas
    let periodStartDate: Date
    let periodEndDate: Date = now // Usar now ao invés de today
    
    if (customStartDate && customEndDate) {
      periodStartDate = new Date(customStartDate)
      periodEndDate = new Date(customEndDate)
      periodEndDate.setHours(23, 59, 59, 999) // Incluir o dia inteiro
    } else {
      periodStartDate = new Date(now)
      if (periodFilter === '7d') {
        periodStartDate.setDate(periodStartDate.getDate() - 7)
      } else if (periodFilter === '30d') {
        periodStartDate.setDate(periodStartDate.getDate() - 30)
      } else {
        periodStartDate.setDate(periodStartDate.getDate() - 90)
      }
    }

    // 1. Tickets por status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: teamWhereClause,
      _count: {
        id: true
      }
    })

    // 2. Tickets por equipe
    const ticketsByTeam = await prisma.ticket.groupBy({
      by: ['team'],
      where: teamWhereClause,
      _count: {
        id: true
      }
    })

    // 3. Tickets por categoria
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      where: teamWhereClause,
      _count: {
        id: true
      }
    })

    // 4. Tickets por urgência
    const ticketsByUrgency = await prisma.ticket.groupBy({
      by: ['urgency'],
      where: teamWhereClause,
      _count: {
        id: true
      }
    })

    // 5. Tickets resolvidos hoje
    const resolvedToday = await prisma.ticket.count({
      where: {
        ...teamWhereClause,
        kanbanStatus: 'done',
        updatedAt: {
          gte: today
        }
      }
    })

    // 6. Tickets resolvidos esta semana
    const resolvedThisWeek = await prisma.ticket.count({
      where: {
        ...teamWhereClause,
        kanbanStatus: 'done',
        updatedAt: {
          gte: weekAgo
        }
      }
    })

    // 7. Tickets criados hoje
    const createdToday = await prisma.ticket.count({
      where: {
        ...teamWhereClause,
        createdAt: {
          gte: today
        }
      }
    })

    // 8. Tickets criados esta semana
    const createdThisWeek = await prisma.ticket.count({
      where: {
        ...teamWhereClause,
        createdAt: {
          gte: weekAgo
        }
      }
    })

    // 9. Performance por responsável (últimos 7 dias)
    const performanceWhereClause = teamFilter && teamFilter !== 'all'
      ? {
          assignedToId: {
            not: null,
            in: teamUserIds
          },
          updatedAt: {
            gte: weekAgo
          }
        }
      : {
          assignedToId: {
            not: null
          },
          updatedAt: {
            gte: weekAgo
          }
        }

    const performanceByAssignee = await prisma.ticket.groupBy({
      by: ['assignedToId'],
      where: performanceWhereClause,
      _count: {
        id: true
      }
    })

    // Buscar nomes dos responsáveis
    const assigneeIds = performanceByAssignee.map(p => p.assignedToId).filter(Boolean)
    const assignees = await prisma.user.findMany({
      where: {
        id: {
          in: assigneeIds as string[]
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    // Mapear performance com nomes
    const performanceWithNames = performanceByAssignee.map(perf => {
      const assignee = assignees.find(a => a.id === perf.assignedToId)
      return {
        assigneeId: perf.assignedToId,
        assigneeName: assignee?.name || 'Usuário não encontrado',
        ticketCount: perf._count.id
      }
    })

    // 10. Tickets por setor (baseado no solicitante)
    const ticketsBySector = await prisma.ticket.groupBy({
      by: ['requesterId'],
      where: teamWhereClause,
      _count: {
        id: true
      }
    })

    // Buscar setores dos solicitantes
    const requesterIds = ticketsBySector.map(t => t.requesterId)
    const requesters = await prisma.user.findMany({
      where: {
        id: {
          in: requesterIds
        }
      },
      select: {
        id: true,
        setor: true
      }
    })

    // Agrupar por setor
    const sectorCounts: Record<string, number> = {}
    ticketsBySector.forEach(ticket => {
      const requester = requesters.find(r => r.id === ticket.requesterId)
      const sector = requester?.setor || 'Não informado'
      sectorCounts[sector] = (sectorCounts[sector] || 0) + ticket._count.id
    })

    const ticketsBySectorFormatted = Object.entries(sectorCounts).map(([sector, count]) => ({
      sector,
      count
    }))

    // 11. Tendência baseada no período selecionado ou datas personalizadas
    const periodDays = customStartDate && customEndDate 
      ? Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : (periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90)
    
    const trendData = []
    
    // Usar a data atual como referência para garantir que hoje seja incluído
    const referenceDate = new Date()
    referenceDate.setHours(0, 0, 0, 0)
    
    // Loop de 0 até periodDays-1 para incluir todos os dias
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(referenceDate)
      date.setDate(date.getDate() - (periodDays - 1 - i))
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const created = await prisma.ticket.count({
        where: {
          ...teamWhereClause,
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      const resolved = await prisma.ticket.count({
        where: {
          ...teamWhereClause,
          kanbanStatus: 'done',
          updatedAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      trendData.push({
        date: date.toISOString().split('T')[0],
        created,
        resolved
      })
    }

    // 12. Tempo médio de resolução (aproximado)
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        ...teamWhereClause,
        kanbanStatus: 'done',
        updatedAt: {
          gte: monthAgo
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    let avgResolutionTime = 0
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        const diff = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime()
        return sum + diff
      }, 0)
      avgResolutionTime = Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)) // em horas
    }

    // 13. Avaliações dos TIs (rating médio por responsável)
    const ratingsWhereClause = teamFilter && teamFilter !== 'all'
      ? {
          rating: {
            not: null
          },
          assignedToId: {
            not: null,
            in: teamUserIds
          }
        }
      : {
          rating: {
            not: null
          },
          assignedToId: {
            not: null
          }
        }

    const ratingsData = await prisma.ticket.findMany({
      where: ratingsWhereClause,
      select: {
        assignedToId: true,
        rating: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            team: true
          }
        }
      }
    })

    // Agrupar avaliações por TI
    const ratingsByTI: Record<string, { name: string; team: string; ratings: number[]; totalTickets: number }> = {}
    
    ratingsData.forEach(ticket => {
      if (ticket.assignedToId && ticket.rating && ticket.assignedTo) {
        if (!ratingsByTI[ticket.assignedToId]) {
          ratingsByTI[ticket.assignedToId] = {
            name: ticket.assignedTo.name,
            team: ticket.assignedTo.team,
            ratings: [],
            totalTickets: 0
          }
        }
        ratingsByTI[ticket.assignedToId].ratings.push(ticket.rating)
        ratingsByTI[ticket.assignedToId].totalTickets++
      }
    })

    // Calcular média e formatar
    const tiRatings = Object.entries(ratingsByTI).map(([id, data]) => {
      const avgRating = data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
      return {
        tiId: id,
        tiName: data.name,
        team: data.team,
        avgRating: Math.round(avgRating * 10) / 10, // 1 casa decimal
        totalRatings: data.ratings.length,
        totalTickets: data.totalTickets,
        ratings: {
          5: data.ratings.filter(r => r === 5).length,
          4: data.ratings.filter(r => r === 4).length,
          3: data.ratings.filter(r => r === 3).length,
          2: data.ratings.filter(r => r === 2).length,
          1: data.ratings.filter(r => r === 1).length,
        }
      }
    }).sort((a, b) => b.avgRating - a.avgRating) // Ordenar por melhor avaliação

    const metrics = {
      summary: {
        resolvedToday,
        resolvedThisWeek,
        createdToday,
        createdThisWeek,
        avgResolutionTime
      },
      ticketsByStatus: ticketsByStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      ticketsByTeam: ticketsByTeam.map(item => ({
        team: item.team || 'Não definido',
        count: item._count.id
      })),
      ticketsByCategory: ticketsByCategory.map(item => ({
        category: item.category,
        count: item._count.id
      })),
      ticketsByUrgency: ticketsByUrgency.map(item => ({
        urgency: item.urgency,
        count: item._count.id
      })),
      ticketsBySector: ticketsBySectorFormatted,
      performanceByAssignee: performanceWithNames,
      trendLast90Days: trendData,
      tiRatings: tiRatings
    }

    console.log('✅ [API Metrics] Métricas calculadas com sucesso')

    return NextResponse.json(metrics)

  } catch (error) {
    console.error("❌ [API Metrics] Erro ao buscar métricas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
