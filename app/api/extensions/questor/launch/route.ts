import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function extractVerificationToken(html: string) {
  const match = html.match(
    /name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/i
  )

  return match?.[1] ?? null
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

  const canUseQuestor =
    session.user.role === "admin" ||
    session.user.role === "lider_sistemas" ||
    session.user.role === "func_sistemas"

  if (!canUseQuestor) {
    return NextResponse.json(
      { error: "Voce nao tem permissao para usar esta integracao." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  const startUrl = process.env.QUESTOR_START_URL
  const redirectUrl = process.env.QUESTOR_PORTAL_URL
  const username = process.env.QUESTOR_USERNAME
  const password = process.env.QUESTOR_PASSWORD

  if (!startUrl || !redirectUrl || !username || !password) {
    return NextResponse.json(
      { error: "Integracao do Questor nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const response = await fetch(startUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    const html = await response.text()
    const verificationToken = extractVerificationToken(html)

    if (!response.ok || !verificationToken) {
      return NextResponse.json(
        { error: "Nao foi possivel preparar o login do Questor." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      )
    }

    const loginUrl = new URL("/Account/Login", startUrl).toString()

    return NextResponse.json(
      {
        loginUrl,
        redirectUrl,
        fields: {
          __RequestVerificationToken: verificationToken,
          UseCaptcha: "False",
          ValidateCaptcha: "False",
          ReturnUrl: "",
          SsoProviderType: "",
          UserName: username,
          Password: password,
        },
        redirectDelayMs: 1300,
        providerLabel: "Questor",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel preparar o login do Questor." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
