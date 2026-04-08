import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const ALLOWED_ROLES = new Set(["admin", "lider_sistemas", "func_sistemas"])

export const dynamic = "force-dynamic"

function extractHiddenValue(html: string, name: string) {
  const match = html.match(
    new RegExp(`name="${name}"[^>]*value="([^"]*)"`, "i")
  )

  return match?.[1] ?? ""
}

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

  const loginUrl = process.env.PLOOMES_LOGIN_URL || "https://app.ploomes.com/Login"
  const redirectUrl = process.env.PLOOMES_APP_URL || "https://app.ploomes.com/"
  const username = process.env.PLOOMES_USERNAME
  const password = process.env.PLOOMES_PASSWORD

  if (!username || !password) {
    return NextResponse.json(
      { error: "Integracao do Ploomes nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const response = await fetch(loginUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    const html = await response.text()
    const viewState = extractHiddenValue(html, "__VIEWSTATE")
    const viewStateGenerator = extractHiddenValue(html, "__VIEWSTATEGENERATOR")
    const eventValidation = extractHiddenValue(html, "__EVENTVALIDATION")

    if (!response.ok || !viewState || !eventValidation) {
      return NextResponse.json(
        { error: "Nao foi possivel preparar o login do Ploomes." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        mode: "form",
        loginUrl,
        redirectUrl,
        fields: {
          __EVENTTARGET: "Bt_Login",
          __EVENTARGUMENT: "",
          __VIEWSTATE: viewState,
          __VIEWSTATEGENERATOR: viewStateGenerator,
          __EVENTVALIDATION: eventValidation,
          Username: username,
          Password: password,
        },
        redirectDelayMs: 1500,
        providerLabel: "Ploomes",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel preparar o login do Ploomes." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
