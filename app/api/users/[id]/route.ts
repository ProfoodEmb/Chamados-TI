import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

// PATCH - Atualizar status do usuário (só para lider_infra)
export async function PATCH(
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

    // Verificar se é líder de infraestrutura
    if (session.user.role !== "lider_infra") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validar status
    const allowedStatuses = ["ativo", "suspenso", "inativo"]
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    // Não permitir alterar o próprio status
    if (id === session.user.id) {
      return NextResponse.json({ error: "Não é possível alterar seu próprio status" }, { status: 400 })
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        username: true,
        status: true,
      }
    })

    // Se suspender, invalidar todas as sessões do usuário
    if (status === "suspenso" || status === "inativo") {
      await prisma.session.deleteMany({
        where: { userId: id }
      })
    }

    return NextResponse.json({ 
      message: `Usuário ${status === "ativo" ? "ativado" : status === "suspenso" ? "suspenso" : "desativado"} com sucesso`,
      user: updatedUser 
    })

  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Deletar usuário (só para lider_infra)
export async function DELETE(
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

    // Verificar se é líder de infraestrutura
    if (session.user.role !== "lider_infra") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params

    // Não permitir deletar a si mesmo
    if (id === session.user.id) {
      return NextResponse.json({ error: "Não é possível deletar sua própria conta" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, username: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Deletar em ordem (devido às foreign keys)
    await prisma.session.deleteMany({ where: { userId: id } })
    await prisma.account.deleteMany({ where: { userId: id } })
    
    // Atualizar tickets para não quebrar referências
    await prisma.ticket.updateMany({
      where: { requesterId: id },
      data: { requesterId: session.user.id } // Transferir para o admin
    })
    
    await prisma.ticket.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null }
    })

    // Deletar mensagens e anexos
    await prisma.message.deleteMany({ where: { authorId: id } })
    await prisma.attachment.deleteMany({ where: { uploadedById: id } })

    // Deletar usuário
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ 
      message: `Usuário ${user.name} (${user.username}) deletado com sucesso`
    })

  } catch (error) {
    console.error("❌ Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}