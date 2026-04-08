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

  const phone = (process.env.ECALC_WHATSAPP_PHONE || "5511998615275").replace(/\D/g, "")
  const message =
    process.env.ECALC_WHATSAPP_MESSAGE ||
    "Olá, preciso de suporte do eCalc pela equipe de Sistemas da Tuicial."

  const redirectUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`

  return NextResponse.json(
    {
      mode: "redirect",
      redirectUrl,
      redirectDelayMs: 120,
      providerLabel: "eCalc",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
