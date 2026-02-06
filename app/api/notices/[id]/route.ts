import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// DELETE - Excluir aviso
export async function DELETE(
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

    // Buscar o aviso para verificar permissões
    const notice = await prisma.notice.findUnique({
      where: { id },
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

    if (!notice) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário pode excluir (admin ou autor)
    const canDelete = session.user.role === "admin" || session.user.id === notice.authorId
    
    if (!canDelete) {
      return NextResponse.json({ error: "Sem permissão para excluir este aviso" }, { status: 403 })
    }

    // Excluir o aviso
    await prisma.notice.delete({
      where: { id }
    })

    console.log('🗑️ Aviso excluído:', { 
      id, 
      title: notice.title, 
      deletedBy: session.user.name 
    })

    // Emitir evento para atualização em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noticeDeleted', { 
        detail: { id, title: notice.title, deletedBy: session.user.name } 
      }))
    }

    return NextResponse.json({ message: "Aviso excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir aviso:", error)
    return NextResponse.json({ error: "Erro ao excluir aviso" }, { status: 500 })
  }
}

// PATCH - Atualizar aviso
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

    // Buscar o aviso para verificar permissões
    const notice = await prisma.notice.findUnique({
      where: { id }
    })

    if (!notice) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário pode editar (admin ou autor)
    const canEdit = session.user.role === "admin" || session.user.id === notice.authorId
    
    if (!canEdit) {
      return NextResponse.json({ error: "Sem permissão para editar este aviso" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      type, 
      priority, 
      level,
      targetSectors,
      scheduledFor,
      expiresAt,
      active
    } = body

    // Validar valores se fornecidos
    if (type) {
      const validTypes = ["info", "warning", "maintenance", "update"]
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
      }
    }

    if (priority) {
      const validPriorities = ["low", "medium", "high"]
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: "Prioridade inválida" }, { status: 400 })
      }
    }

    if (level) {
      const validLevels = ["general", "urgent", "critical_system"]
      if (!validLevels.includes(level)) {
        return NextResponse.json({ error: "Nível inválido" }, { status: 400 })
      }
    }

    // Validar datas se fornecidas
    let scheduledDate = undefined
    let expirationDate = undefined

    if (scheduledFor !== undefined) {
      if (scheduledFor === null || scheduledFor === '') {
        scheduledDate = null
      } else {
        // Para datas que vêm como YYYY-MM-DD, definir horário como início do dia
        scheduledDate = new Date(scheduledFor + 'T00:00:00')
        
        // Verificar se a data é hoje ou no futuro
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (scheduledDate < today) {
          return NextResponse.json({ error: "Data de programação deve ser hoje ou no futuro" }, { status: 400 })
        }
      }
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '') {
        expirationDate = null
      } else {
        // Para datas que vêm como YYYY-MM-DD, definir horário como final do dia
        expirationDate = new Date(expiresAt + 'T23:59:59')
        const compareDate = scheduledDate || new Date()
        if (expirationDate <= compareDate) {
          return NextResponse.json({ error: "Data de expiração deve ser posterior à data de publicação" }, { status: 400 })
        }
      }
    }

    // Atualizar o aviso
    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type }),
        ...(priority !== undefined && { priority }),
        ...(level !== undefined && { level }),
        ...(targetSectors !== undefined && { targetSectors }),
        ...(scheduledDate !== undefined && { scheduledFor: scheduledDate }),
        ...(expirationDate !== undefined && { expiresAt: expirationDate }),
        ...(active !== undefined && { active }),
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

    console.log('✏️ Aviso atualizado:', { 
      id, 
      title: updatedNotice.title, 
      updatedBy: session.user.name 
    })

    // Emitir evento para atualização em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('noticeUpdated', { 
        detail: { notice: updatedNotice, updatedBy: session.user.name } 
      }))
    }

    return NextResponse.json(updatedNotice)
  } catch (error) {
    console.error("Erro ao atualizar aviso:", error)
    return NextResponse.json({ error: "Erro ao atualizar aviso" }, { status: 500 })
  }
}