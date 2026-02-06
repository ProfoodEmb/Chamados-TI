import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Listar apenas usuários de TI (para filtros do Kanban)
export async function GET() {
  try {
    console.log('🔍 [API Users TI] Buscando usuários de TI...')

    const tiUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["admin", "lider_infra", "func_infra", "lider_sistemas", "func_sistemas"]
        }
      },
      select: {
        id: true,
        name: true,
        role: true,
        team: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('✅ [API Users TI] Usuários de TI encontrados:', tiUsers.length)

    return NextResponse.json(tiUsers)

  } catch (error) {
    console.error("❌ [API Users TI] Erro ao buscar usuários de TI:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}