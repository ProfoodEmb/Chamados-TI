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
      { error: "Sessao expirada. Faca login novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (!ALLOWED_ROLES.has(session.user.role)) {
    return NextResponse.json(
      { error: "Voce nao tem permissao para usar esta integracao." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  const loginUrl = process.env.PRINTSERVE_LOGIN_URL
  const username = process.env.PRINTSERVE_USERNAME
  const password = process.env.PRINTSERVE_PASSWORD

  if (!loginUrl || !username || !password) {
    return NextResponse.json(
      { error: "Integracao da PrintServe nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  const redirectUrl =
    process.env.PRINTSERVE_TICKET_URL || new URL("/pws/index.php/pws/Chamados", loginUrl).toString()

  return NextResponse.json(
    {
      loginUrl,
      redirectUrl,
      fields: {
        _method: "POST",
        "data[User][user_email]": username,
        "data[User][user_password]": password,
        "data[User][remember_me]": "1",
      },
      redirectDelayMs: 1200,
      providerLabel: "PrintServe",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
