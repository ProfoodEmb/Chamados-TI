import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db/prisma"

// GET - Buscar estatísticas pessoais do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o usuário está buscando suas próprias estatísticas ou se é admin/líder
    const isOwnStats = id === session.user.id
    const isAdmin = session.user.role === "admin" || 
                   session.user.role === "lider_infra" || 
                   session.user.role === "lider_sistemas"

    if (!isOwnStats && !isAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar tickets atribuídos ao usuário
    const tickets = await prisma.ticket.findMany({
      where: {
        assignedToId: id
      },
      select: {
        id: true,
        kanbanStatus: true,
        status: true
      }
    })

    // Calcular estatísticas
    const total = tickets.length
    const resolved = tickets.filter(t => t.kanbanStatus === 'done').length
    const inProgress = tickets.filter(t => 
      t.kanbanStatus === 'in_progress' || 
      t.kanbanStatus === 'doing'
    ).length
    const inReview = tickets.filter(t => t.kanbanStatus === 'review').length

    const stats = {
      total,
      resolved,
      inProgress,
      inReview
    }

    console.log(`📊 [API User Stats] Estatísticas do usuário ${id}:`, stats)

    return NextResponse.json(stats)

  } catch (error) {
    console.error("❌ [API User Stats] Erro ao buscar estatísticas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
