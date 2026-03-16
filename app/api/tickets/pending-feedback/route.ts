import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar chamados fechados sem avaliação do usuário
    const pendingFeedback = await prisma.ticket.findMany({
      where: {
        requesterId: userId,
        status: "Fechado",
        rating: null, // Sem avaliação
      },
      select: {
        id: true,
        number: true,
        subject: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      hasPendingFeedback: pendingFeedback.length > 0,
      pendingTickets: pendingFeedback,
    })
  } catch (error) {
    console.error("Erro ao verificar feedback pendente:", error)
    return NextResponse.json(
      { error: "Erro ao verificar feedback pendente" },
      { status: 500 }
    )
  }
}
