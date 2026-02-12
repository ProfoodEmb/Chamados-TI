"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

// Tipos
interface CreateUserInput {
  name: string
  email: string
  username: string
  password: string
  role: string
  team: string
  setor?: string
  empresa?: string
  phone?: string
}

interface UpdateUserInput {
  id: string
  name?: string
  email?: string
  role?: string
  team?: string
  setor?: string
  empresa?: string
  phone?: string
  password?: string
}

// Listar usuários
export async function getUsers(filters?: { status?: string; search?: string; team?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"

    // Verificar permissões
    if (userRole !== "lider_infra" && userRole !== "lider_sistemas" && userRole !== "admin") {
      throw new Error("Acesso negado")
    }

    // Construir filtros
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters?.team && filters.team !== 'all') {
      where.team = filters.team
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        team: true,
        setor: true,
        empresa: true,
        phone: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao buscar usuários" }
  }
}

// Criar usuário
export async function createUser(input: CreateUserInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    // Verificar se é líder de infraestrutura ou admin
    if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
      throw new Error("Acesso negado. Apenas líderes de infraestrutura e admins podem criar usuários.")
    }

    // Verificar se username ou email já existem
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: input.username },
          { email: input.email }
        ]
      }
    })

    if (existingUser) {
      return { success: false, error: "Username ou email já cadastrado" }
    }

    // Hash da senha
    const hashedPassword = await hash(input.password, 10)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        username: input.username,
        role: input.role,
        team: input.team,
        setor: input.setor,
        empresa: input.empresa,
        phone: input.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        team: true,
        setor: true,
        empresa: true,
        phone: true,
        createdAt: true,
      }
    })

    // Criar conta com senha
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      }
    })

    // Revalidar cache
    revalidatePath('/ti/usuarios')

    return { success: true, data: user }
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao criar usuário" }
  }
}

// Atualizar usuário
export async function updateUser(input: UpdateUserInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    // Verificar se é líder de infraestrutura ou admin
    if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
      throw new Error("Acesso negado")
    }

    const { id, password, ...updateData } = input

    // Se houver senha, fazer hash
    if (password) {
      const hashedPassword = await hash(password, 10)
      Object.assign(updateData, { password: hashedPassword })
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        team: true,
        setor: true,
        empresa: true,
        phone: true,
        createdAt: true,
      }
    })

    // Revalidar cache
    revalidatePath('/ti/usuarios')

    return { success: true, data: user }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar usuário" }
  }
}

// Deletar usuário
export async function deleteUser(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    // Verificar se é líder de infraestrutura ou admin
    if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
      throw new Error("Acesso negado")
    }

    await prisma.user.delete({
      where: { id }
    })

    // Revalidar cache
    revalidatePath('/ti/usuarios')

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar usuário" }
  }
}

// Buscar usuários da equipe T.I.
export async function getTIUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: { contains: 'infra' } },
          { role: { contains: 'sistemas' } },
          { role: 'admin' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: true,
        image: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Erro ao buscar usuários T.I.:", error)
    return { success: false, error: "Erro ao buscar usuários T.I." }
  }
}
