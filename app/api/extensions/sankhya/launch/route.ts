import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const ALLOWED_ROLES = new Set(["admin", "lider_sistemas", "func_sistemas"])

const SANKHYA_APP_HEADER_ID = "2"
const SANKHYA_APP_SECRET = "$2y$10$c0aexjzdcu.uvJUH.a0YZ.q.DymR4VYhKUvhjk4lPj9R8C2h7SKvK"
const DEFAULT_APPLICATION_ID = 10

type SankhyaResponse = {
  data?: {
    access_token?: string
    jwt?: string
  } | string | null
  response?: {
    error?: boolean
    message?: string
    status?: number
  }
  message?: string
}

export const dynamic = "force-dynamic"

function getSankhyaHeaders(contentType = true) {
  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "Application-Origin": "sankhya-login",
    "Application-Id": SANKHYA_APP_HEADER_ID,
    "Application-Secret": SANKHYA_APP_SECRET,
    "User-Agent": "Mozilla/5.0",
  }

  if (contentType) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

async function parseJson(response: Response) {
  try {
    return (await response.json()) as SankhyaResponse
  } catch {
    return null
  }
}

function getErrorMessage(result: SankhyaResponse | null, fallback: string) {
  return result?.response?.message || result?.message || fallback
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

  const authUrl =
    process.env.SANKHYA_AUTH_URL || "https://account-api.sankhya.com.br/authentication"
  const zendeskTokenUrl =
    process.env.SANKHYA_ZENDESK_TOKEN_URL || "https://account-api.sankhya.com.br/token-zendesk"
  const helpCenterUrl =
    process.env.SANKHYA_HELP_URL || "https://ajuda.sankhya.com.br/hc/pt-br"
  const username = process.env.SANKHYA_USERNAME
  const password = process.env.SANKHYA_PASSWORD
  const applicationId = Number(process.env.SANKHYA_APPLICATION_ID || DEFAULT_APPLICATION_ID)

  if (!username || !password) {
    return NextResponse.json(
      { error: "Integracao da Sankhya nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const authResponse = await fetch(authUrl, {
      method: "POST",
      cache: "no-store",
      headers: getSankhyaHeaders(),
      body: JSON.stringify({
        application_id: applicationId,
        username,
        password,
      }),
    })

    const authResult = await parseJson(authResponse)
    const accessToken =
      typeof authResult?.data === "object" && authResult?.data
        ? authResult.data.access_token
        : undefined

    if (!authResponse.ok || !accessToken) {
      const remoteMessage = getErrorMessage(
        authResult,
        "Nao foi possivel autenticar na Sankhya."
      )

      const friendlyMessage =
        authResponse.status === 410
          ? "A Sankhya rejeitou a senha configurada. Revise as credenciais da extensao."
          : remoteMessage

      return NextResponse.json(
        { error: friendlyMessage },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      )
    }

    const zendeskResponse = await fetch(
      `${zendeskTokenUrl}?token=${encodeURIComponent(accessToken)}`,
      {
        method: "GET",
        cache: "no-store",
        headers: getSankhyaHeaders(false),
      }
    )

    const zendeskResult = await parseJson(zendeskResponse)
    const zendeskJwt =
      typeof zendeskResult?.data === "string"
        ? zendeskResult.data
        : typeof zendeskResult?.data === "object" && zendeskResult?.data
          ? zendeskResult.data.jwt
          : undefined

    if (!zendeskResponse.ok || !zendeskJwt) {
      return NextResponse.json(
        {
          error: getErrorMessage(
            zendeskResult,
            "Nao foi possivel preparar o acesso da Sankhya."
          ),
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      )
    }

    return NextResponse.json(
      {
        mode: "redirect",
        helperUrl: `https://sankhya.zendesk.com/access/jwt?jwt=${encodeURIComponent(zendeskJwt)}`,
        redirectUrl: helpCenterUrl,
        redirectDelayMs: 1400,
        providerLabel: "Sankhya",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel preparar o acesso da Sankhya." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
