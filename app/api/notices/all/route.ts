import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// GET - Listar todos os avisos (para gerenciamento)
export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é líder ou admin
    const userRole = session.user.role
    if (!userRole.includes("lider") && userRole !== "admin") {
      return NextResponse.json({ error: "Apenas líderes podem gerenciar avisos" }, { status: 403 })
    }
    
    const notices = await prisma.notice.findMany({
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
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(notices)
  } catch (error) {
    console.error("Erro ao buscar todos os avisos:", error)
    return NextResponse.json({ error: "Erro ao buscar avisos" }, { status: 500 })
  }
}