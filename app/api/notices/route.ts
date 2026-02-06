import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// GET - Listar avisos ativos (considerando programação e expiração)
export async function GET() {
  try {
    const now = new Date()
    
    const notices = await prisma.notice.findMany({
      where: { 
        active: true,
        AND: [
          {
            OR: [
              { scheduledFor: null }, // Avisos imediatos
              { scheduledFor: { lte: now } } // Avisos programados que já devem aparecer
            ]
          },
          {
            OR: [
              { expiresAt: null }, // Avisos que não expiram
              { expiresAt: { gt: now } } // Avisos que ainda não expiraram
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: [
        { level: 'desc' }, // critical_system, urgent, general
        { priority: 'desc' }, // critical, high, medium, low
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(notices)
  } catch (error) {
    console.error("Erro ao buscar avisos:", error)
    return NextResponse.json({ error: "Erro ao buscar avisos" }, { status: 500 })
  }
}

// POST - Criar novo aviso (apenas usuários T.I.)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é usuário T.I.
    const userRole = session.user.role
    const isTIUser = userRole === "admin" || 
                     userRole === "lider_infra" || 
                     userRole === "func_infra" || 
                     userRole === "lider_sistemas" || 
                     userRole === "func_sistemas"
    
    if (!isTIUser) {
      return NextResponse.json({ error: "Apenas usuários T.I. podem criar avisos" }, { status: 403 })
    }

    const body = await request.json()
    console.log('📝 Dados recebidos para criar aviso:', body)
    
    const { 
      title, 
      content, 
      type, 
      priority, 
      level = "general",
      targetSectors,
      scheduledFor,
      expiresAt
    } = body

    console.log('📅 Datas recebidas:', { scheduledFor, expiresAt })

    if (!title || !content || !type || !priority) {
      return NextResponse.json({ error: "Campos obrigatórios: title, content, type, priority" }, { status: 400 })
    }

    // Validar valores
    const validTypes = ["info", "warning", "maintenance", "update"]
    const validPriorities = ["low", "medium", "high"]
    const validLevels = ["general", "urgent", "critical_system"]

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Prioridade inválida" }, { status: 400 })
    }

    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Nível inválido" }, { status: 400 })
    }

    // Validar datas (mais simples e permissivo)
    let scheduledDate = null
    let expirationDate = null

    // Se scheduledFor está vazio ou null, publicar imediatamente
    if (scheduledFor && scheduledFor !== '' && scheduledFor !== 'null') {
      try {
        scheduledDate = new Date(scheduledFor + 'T00:00:00')
        console.log('📅 Data programada processada:', scheduledDate)
      } catch (error) {
        console.error('❌ Erro ao processar data programada:', error)
        return NextResponse.json({ error: "Formato de data inválido" }, { status: 400 })
      }
    }

    // Se expiresAt está vazio ou null, não expira
    if (expiresAt && expiresAt !== '' && expiresAt !== 'null') {
      try {
        expirationDate = new Date(expiresAt + 'T23:59:59')
        console.log('📅 Data de expiração processada:', expirationDate)
      } catch (error) {
        console.error('❌ Erro ao processar data de expiração:', error)
        return NextResponse.json({ error: "Formato de data de expiração inválido" }, { status: 400 })
      }
    }

    console.log('📅 Datas finais:', { scheduledDate, expirationDate })

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        type,
        priority,
        level,
        targetSectors,
        scheduledFor: scheduledDate,
        publishedAt: scheduledDate ? null : new Date(), // Se não programado, publica imediatamente
        expiresAt: expirationDate,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    console.log('📢 Novo aviso criado:', { 
      title, 
      type, 
      priority, 
      level,
      scheduled: !!scheduledDate,
      expires: !!expirationDate,
      author: session.user.name 
    })

    // Emitir evento para atualização em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noticeCreated', { 
        detail: { notice, author: session.user.name } 
      }))
    }

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar aviso:", error)
    return NextResponse.json({ error: "Erro ao criar aviso" }, { status: 500 })
  }
}