import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db/prisma"

// PATCH - Atualizar usuário (só para lider_infra e admin)
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

    // Verificar se é líder de infraestrutura ou admin
    if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, name, username, role, setor, password } = body

    // Não permitir alterar a si mesmo (exceto senha)
    if (id === session.user.id && (status || role)) {
      return NextResponse.json({ error: "Não é possível alterar seu próprio status ou cargo" }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    // Atualizar status se fornecido
    if (status) {
      const allowedStatuses = ["ativo", "suspenso", "inativo"]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 })
      }
      updateData.status = status
    }

    // Atualizar nome se fornecido
    if (name) {
      updateData.name = name
    }

    // Atualizar username se fornecido
    if (username) {
      // Verificar se o username já existe (exceto para o próprio usuário)
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: "Nome de usuário já está em uso" }, { status: 400 })
      }

      updateData.username = username
    }

    // Atualizar role se fornecido
    if (role) {
      const allowedRoles = ["user", "func_infra", "lider_infra", "lider_sistemas", "func_sistemas"]
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: "Cargo inválido" }, { status: 400 })
      }
      updateData.role = role
      
      // Auto-atualizar team baseado no role
      if (role.includes("infra")) {
        updateData.team = "infra"
      } else if (role.includes("sistemas")) {
        updateData.team = "sistemas"
      } else {
        updateData.team = "user"
      }
    }

    // Atualizar setor se fornecido
    if (setor !== undefined) {
      updateData.setor = setor
    }

    // Atualizar senha se fornecida
    if (password) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Atualizar senha na tabela Account
      await prisma.account.updateMany({
        where: { 
          userId: id,
          providerId: 'credential'
        },
        data: { password: hashedPassword }
      })
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        team: true,
        setor: true,
        status: true,
      }
    })

    // Se suspender ou desativar, invalidar todas as sessões do usuário
    if (status === "suspenso" || status === "inativo") {
      await prisma.session.deleteMany({
        where: { userId: id }
      })
    }

    return NextResponse.json({ 
      message: `Usuário atualizado com sucesso`,
      user: updatedUser 
    })

  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Deletar usuário (só para lider_infra e admin)
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

    // Verificar se é líder de infraestrutura ou admin
    if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
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