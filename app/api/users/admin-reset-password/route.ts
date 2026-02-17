import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Apenas admin pode resetar senhas
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "userId e newPassword são obrigatórios" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const account = user.accounts.find(acc => acc.providerId === 'credential')

    if (!account) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    // Usar Better Auth para criar o hash correto
    const crypto = require('crypto')
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha256').toString('hex')
    const hashedPassword = `${salt}:${hash}`

    // Atualizar a senha
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      message: "Senha resetada com sucesso",
      username: user.username,
      newPassword: newPassword
    })
  } catch (error) {
    console.error("Erro ao resetar senha:", error)
    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    )
  }
}
