import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const ALLOWED_ROLES = new Set(["admin", "lider_sistemas", "func_sistemas"])

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

  const loginUrl = process.env.MERCOS_LOGIN_URL || "https://app.mercos.com/login"
  const redirectUrl = process.env.MERCOS_APP_URL || "https://app.mercos.com/"
  const username = process.env.MERCOS_USERNAME
  const password = process.env.MERCOS_PASSWORD

  if (!username || !password) {
    return NextResponse.json(
      { error: "Integracao do Mercos nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(
    {
      mode: "form",
      loginUrl,
      redirectUrl,
      fields: {
        usuario: username,
        senha: password,
      },
      redirectDelayMs: 1400,
      providerLabel: "Mercos",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
