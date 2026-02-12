"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Tipos
interface CreateNoticeInput {
  title: string
  content: string
  type: string
  priority?: string
  level?: string
  targetSectors?: string | null
  scheduledFor?: Date
  expiresAt?: Date
}

interface UpdateNoticeInput {
  id: string
  title?: string
  content?: string
  type?: string
  priority?: string
  level?: string
  targetSectors?: string | null
  scheduledFor?: Date
  expiresAt?: Date
  active?: boolean
}

// Listar avisos
export async function getNotices() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"
    const isStaff = userRole.includes("lider") || userRole.includes("func") || userRole === "admin"

    // Filtrar avisos baseado no público-alvo
    const where: any = {
      active: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    }

    // Usuários comuns veem apenas avisos para "all" e "users"
    if (!isStaff) {
      where.targetAudience = {
        in: ["all", "users"]
      }
    }

    const notices = await prisma.notice.findMany({
      where,
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
      orderBy: [
        { type: 'desc' }, // urgent > warning > info
        { createdAt: 'desc' }
      ]
    })

    return { success: true, data: notices }
  } catch (error) {
    console.error("Erro ao buscar avisos:", error)
    return { success: false, error: "Erro ao buscar avisos" }
  }
}

// Listar todos os avisos (para T.I.)
export async function getAllNotices() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"
    const isStaff = userRole.includes("lider") || userRole.includes("func") || userRole === "admin"

    if (!isStaff) {
      throw new Error("Acesso negado")
    }

    const notices = await prisma.notice.findMany({
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
        createdAt: 'desc'
      }
    })

    return { success: true, data: notices }
  } catch (error) {
    console.error("Erro ao buscar todos os avisos:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao buscar avisos" }
  }
}

// Criar aviso
export async function createNotice(input: CreateNoticeInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"
    const isStaff = userRole.includes("lider") || userRole.includes("func") || userRole === "admin"

    if (!isStaff) {
      throw new Error("Acesso negado. Apenas equipe T.I. pode criar avisos.")
    }

    const notice = await prisma.notice.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        priority: input.priority || 'normal',
        level: input.level || 'general',
        targetSectors: input.targetSectors,
        expiresAt: input.expiresAt,
        authorId: session.user.id,
        active: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    // Revalidar cache
    revalidatePath('/')
    revalidatePath('/avisos')
    revalidatePath('/ti/avisos')

    return { success: true, data: notice }
  } catch (error) {
    console.error("Erro ao criar aviso:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao criar aviso" }
  }
}

// Atualizar aviso
export async function updateNotice(input: UpdateNoticeInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"
    const isStaff = userRole.includes("lider") || userRole.includes("func") || userRole === "admin"

    if (!isStaff) {
      throw new Error("Acesso negado")
    }

    const { id, ...updateData } = input

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    // Revalidar cache
    revalidatePath('/')
    revalidatePath('/avisos')
    revalidatePath('/ti/avisos')

    return { success: true, data: notice }
  } catch (error) {
    console.error("Erro ao atualizar aviso:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar aviso" }
  }
}

// Deletar aviso
export async function deleteNotice(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("Não autenticado")
    }

    const userRole = session.user.role || "user"
    const isStaff = userRole.includes("lider") || userRole.includes("func") || userRole === "admin"

    if (!isStaff) {
      throw new Error("Acesso negado")
    }

    await prisma.notice.delete({
      where: { id }
    })

    // Revalidar cache
    revalidatePath('/')
    revalidatePath('/avisos')
    revalidatePath('/ti/avisos')

    return { success: true }
  } catch (error) {
    console.error("Erro ao deletar aviso:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar aviso" }
  }
}
