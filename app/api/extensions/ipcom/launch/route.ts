import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `https://${url}`
}

function buildIpcomScriptUrl({
  sessionUrl,
  pagesRoutesUrl,
  dashboardUrl,
  username,
  password,
}: {
  sessionUrl: string
  pagesRoutesUrl: string
  dashboardUrl: string
  username: string
  password: string
}) {
  const script = `
    void (async () => {
      try {
        const sessionResponse = await fetch(${JSON.stringify(sessionUrl)}, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify({
            email: ${JSON.stringify(username)},
            password: ${JSON.stringify(password)},
          }),
        });

        const sessionData = await sessionResponse.json().catch(() => null);

        if (!sessionResponse.ok || !sessionData?.token || !sessionData?.refresh_token) {
          const message =
            sessionData?.message ||
            sessionData?.error ||
            "Nao foi possivel autenticar na IPCOM.";

          throw new Error(message);
        }

        const cookieSuffix =
          "; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");

        document.cookie =
          "ipcom.token=" + encodeURIComponent(sessionData.token) + cookieSuffix;
        document.cookie =
          "ipcom.refresh_token=" +
          encodeURIComponent(sessionData.refresh_token) +
          cookieSuffix;
        document.cookie = "ipcom.request_sign_out=false" + cookieSuffix;

        try {
          await fetch(${JSON.stringify(pagesRoutesUrl)}, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + sessionData.token,
            },
            mode: "cors",
            credentials: "omit",
          });
        } catch {
          // A rota serve apenas para aquecer a sessao; falhas aqui nao impedem o acesso.
        }

        location.replace(${JSON.stringify(dashboardUrl)});
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Nao foi possivel autenticar na IPCOM.";

        alert(message);
      }
    })();
  `.trim()

  return `javascript:${encodeURIComponent(script)}`
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

  if (session.user.role !== "lider_infra") {
    return NextResponse.json(
      { error: "Voce nao tem permissao para usar esta integracao." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  const startUrl = normalizeUrl(process.env.IPCOM_START_URL || "https://tuicial.ipcom.app.br")
  const sessionUrl = process.env.IPCOM_SESSION_URL || "https://server8.ipcom.com.br:6016/sessions"
  const pagesRoutesUrl =
    process.env.IPCOM_PAGESROUTES_URL || new URL("/pagesroutes", sessionUrl).toString()
  const username = process.env.IPCOM_USERNAME
  const password = process.env.IPCOM_PASSWORD

  if (!username || !password) {
    return NextResponse.json(
      { error: "Integracao da IPCOM nao configurada no ambiente." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }

  const dashboardUrl =
    process.env.IPCOM_DASHBOARD_URL || new URL("/dashboard", startUrl).toString()

  return NextResponse.json(
    {
      mode: "script",
      startUrl,
      redirectUrl: dashboardUrl,
      scriptUrl: buildIpcomScriptUrl({
        sessionUrl,
        pagesRoutesUrl,
        dashboardUrl,
        username,
        password,
      }),
      redirectDelayMs: 1700,
      providerLabel: "IPCOM",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
