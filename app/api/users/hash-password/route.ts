import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

// Endpoint temporário para gerar hash de senha usando Better Auth
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 })
    }

    // Criar um usuário temporário para pegar o hash
    const tempEmail = `temp_${Date.now()}@temp.com`
    
    const result = await auth.api.signUpEmail({
      body: {
        email: tempEmail,
        password: password,
        name: "Temp",
        username: `temp_${Date.now()}`,
        role: "user",
        team: "user",
        setor: "temp",
        empresa: "profood",
      }
    })

    // Buscar o hash gerado
    const { prisma } = await import("@/lib/db/prisma")
    const account = await prisma.account.findFirst({
      where: {
        userId: result.user?.id,
        providerId: 'credential'
      }
    })

    const hash = account?.password

    // Deletar usuário temporário
    if (result.user?.id) {
      await prisma.account.deleteMany({ where: { userId: result.user.id } })
      await prisma.user.delete({ where: { id: result.user.id } })
    }

    return NextResponse.json({ hash })

  } catch (error) {
    console.error("Erro ao gerar hash:", error)
    return NextResponse.json({ error: "Erro ao gerar hash" }, { status: 500 })
  }
}
