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

  const redirectUrl = process.env.POWERBI_APP_URL || "https://app.powerbi.com/"

  return NextResponse.json(
    {
      mode: "redirect",
      redirectUrl,
      redirectDelayMs: 120,
      providerLabel: "Power BI",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
