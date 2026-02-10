import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await context.params
    const ticketId = params.id
    const body = await request.json()
    const { rating, feedback } = body

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação deve ser entre 1 e 5 estrelas" }, { status: 400 })
    }

    // Buscar o ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar se é o solicitante
    if (ticket.requesterId !== session.user.id) {
      return NextResponse.json({ error: "Apenas o solicitante pode avaliar" }, { status: 403 })
    }

    // Verificar se o ticket está resolvido
    if (ticket.status !== "Resolvido") {
      return NextResponse.json({ error: "Apenas chamados resolvidos podem ser avaliados" }, { status: 400 })
    }

    // Salvar avaliação e fechar o chamado
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        rating,
        feedback: feedback || null,
        status: "Fechado",
        updatedAt: new Date(),
      },
      include: {
        requester: true,
        assignedTo: true,
        messages: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        attachments: {
          include: {
            uploadedBy: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Erro ao avaliar chamado:", error)
    return NextResponse.json(
      { error: "Erro ao avaliar chamado" },
      { status: 500 }
    )
  }
}
