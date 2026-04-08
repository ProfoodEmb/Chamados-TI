import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawIdentifier = typeof body?.identifier === "string" ? body.identifier : ""
    const identifier = rawIdentifier.trim()

    if (!identifier) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 })
    }

    if (identifier.includes("@")) {
      return NextResponse.json({ email: identifier.toLowerCase() })
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: identifier,
          mode: "insensitive",
        },
      },
      select: {
        email: true,
      },
    })

    return NextResponse.json({
      email: user?.email ?? `${identifier.toLowerCase()}@empresa.com`,
    })
  } catch {
    return NextResponse.json({ error: "Erro ao resolver login" }, { status: 500 })
  }
}
