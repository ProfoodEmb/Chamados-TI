import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar usuário e sua conta
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a conta de email/password do usuário
    const account = user.accounts.find(acc => acc.providerId === 'credential')

    if (!account || !account.password) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 })
    }

    // Better Auth usa formato salt:hash
    const [salt, hash] = account.password.split(':')
    const currentHash = crypto.pbkdf2Sync(currentPassword, salt, 10000, 64, 'sha256').toString('hex')

    // Verificar senha atual
    if (currentHash !== hash) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Criar hash da nova senha no formato Better Auth
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha256').toString('hex')
    const hashedPassword = `${newSalt}:${newHash}`

    // Atualizar senha na tabela Account
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json(
      { error: "Erro ao alterar senha" },
      { status: 500 }
    )
  }
}
