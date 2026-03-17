import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const ALLOWED_ROLES = new Set([
  "admin",
  "lider_infra",
  "func_infra",
  "lider_sistemas",
  "func_sistemas",
])

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json(
      { error: "Sessão expirada. Faça login novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (!ALLOWED_ROLES.has(session.user.role)) {
    return NextResponse.json(
      { error: "Você não tem permissão para usar esta integração." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  const loginUrl = process.env.CONSTEL_LOGIN_URL
  const username = process.env.CONSTEL_USERNAME
  const password = process.env.CONSTEL_PASSWORD

  if (!loginUrl || !username || !password) {
    return NextResponse.json(
      { error: "Integração da Constel não configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  const ticketUrl = process.env.CONSTEL_TICKET_URL || new URL("/Ticket", loginUrl).toString()

  return NextResponse.json(
    {
      loginUrl,
      redirectUrl: ticketUrl,
      fields: {
        UserName: username,
        Password: password,
      },
      redirectDelayMs: 1400,
      providerLabel: "Constel",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
