import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  console.log('📋 Sessão atual:', session ? {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    team: session.user.team
  } : 'Nenhuma sessão')

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: session.user })
}
