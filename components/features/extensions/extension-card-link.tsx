"use client"

import { type MouseEvent, type ReactNode, useState } from "react"

interface FormExtensionLaunchConfig {
  mode?: "form"
  loginUrl: string
  redirectUrl: string
  fields: Record<string, string>
  redirectDelayMs: number
  providerLabel: string
}

interface ScriptExtensionLaunchConfig {
  mode: "script"
  startUrl: string
  redirectUrl: string
  scriptUrl: string
  redirectDelayMs: number
  providerLabel: string
}

interface RedirectExtensionLaunchConfig {
  mode: "redirect"
  redirectUrl: string
  redirectDelayMs: number
  providerLabel: string
  helperUrl?: string
}

type ExtensionLaunchConfig =
  | FormExtensionLaunchConfig
  | ScriptExtensionLaunchConfig
  | RedirectExtensionLaunchConfig

interface ExtensionCardLinkProps {
  provider?:
    | "constel"
    | "printserve"
    | "ipcom"
    | "questor"
    | "sankhya"
    | "ecalc"
    | "mercos"
    | "ploomes"
    | "powerbi"
  href?: string
  className: string
  children: ReactNode
  disabled?: boolean
}

function showInfoToast(message: string) {
  if (typeof window !== "undefined" && (window as typeof window & { showSimpleToast?: (message: string, type?: "success" | "info") => void }).showSimpleToast) {
    ;(window as typeof window & { showSimpleToast: (message: string, type?: "success" | "info") => void }).showSimpleToast(message, "info")
    return
  }

  window.alert(message)
}

function writeConstelLoadingPage(targetWindow: Window, title: string, message: string) {
  targetWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          :root {
            color-scheme: light;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background:
              radial-gradient(circle at top, rgba(3, 159, 160, 0.18), transparent 38%),
              linear-gradient(180deg, #f8fafc 0%, #eef5f7 100%);
            color: #0f172a;
          }

          .shell {
            width: min(460px, calc(100vw - 48px));
            padding: 34px 28px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(148, 163, 184, 0.2);
            box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
            text-align: center;
          }

          .spinner {
            width: 54px;
            height: 54px;
            margin: 0 auto 18px;
            border-radius: 999px;
            border: 4px solid rgba(3, 159, 160, 0.16);
            border-top-color: #039fa0;
            animation: spin 0.85s linear infinite;
          }

          h1 {
            margin: 0 0 10px;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
          }

          p {
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        </style>
      </head>
      <body>
        <main class="shell">
          <div class="spinner"></div>
          <h1>${title}</h1>
          <p>${message}</p>
        </main>
      </body>
    </html>
  `)
  targetWindow.document.close()
}

export function ExtensionCardLink({
  provider,
  href,
  className,
  children,
  disabled = false,
}: ExtensionCardLinkProps) {
  const [isLaunching, setIsLaunching] = useState(false)

  const handleProviderLaunch = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!provider || isLaunching) {
      return
    }

    const tabName = `${provider}-tab-${Date.now()}`
    const tab = window.open("about:blank", "_blank")

    if (!tab) {
      showInfoToast("Permita a abertura de nova guia para iniciar o login automatico.")
      return
    }

    tab.name = tabName
    writeConstelLoadingPage(
      tab,
      "Preparando acesso...",
      "Estamos validando seu acesso e preparando a abertura do sistema."
    )
    tab.focus()

    const helperName = `${provider}-helper-${Date.now()}`
    const helperWindow = window.open(
      "about:blank",
      helperName,
      "popup=yes,width=80,height=80,left=-10000,top=-10000"
    )

    const useHelperWindow = Boolean(helperWindow && !helperWindow.closed)

    if (helperWindow && !helperWindow.closed) {
      helperWindow.name = helperName
      writeConstelLoadingPage(
        helperWindow,
        "Autenticando...",
        "Finalizando o login em segundo plano."
      )

      try {
        helperWindow.resizeTo(80, 80)
        helperWindow.moveTo(-10000, -10000)
        helperWindow.blur()
        tab.focus()
      } catch {
        // Ignora falhas de posicionamento do navegador.
      }
    }

    setIsLaunching(true)

    try {
      const response = await fetch(`/api/extensions/${provider}/launch`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || "Não foi possível iniciar o login automático da extensão.")
      }

      const config = (await response.json()) as ExtensionLaunchConfig

      if (config.mode === "redirect") {
        writeConstelLoadingPage(
          tab,
          `Conectando na ${config.providerLabel}...`,
          "Estamos preparando a abertura do sistema."
        )

        const navigate = (targetWindow: Window, url: string) => {
          try {
            targetWindow.location.replace(url)
          } catch {
            targetWindow.location.href = url
          }
        }

        let hasFinishedRedirect = false
        const finishRedirect = () => {
          if (hasFinishedRedirect || tab.closed) {
            return
          }

          hasFinishedRedirect = true

          if (helperWindow && !helperWindow.closed) {
            helperWindow.close()
          }

          navigate(tab, config.redirectUrl)
        }

        if (useHelperWindow && helperWindow && config.helperUrl) {
          helperWindow.addEventListener(
            "load",
            () => {
              window.setTimeout(finishRedirect, 80)
            },
            { once: true }
          )

          navigate(helperWindow, config.helperUrl)
          window.setTimeout(finishRedirect, config.redirectDelayMs)
        } else {
          window.setTimeout(() => {
            if (!tab.closed) {
              navigate(tab, config.redirectUrl)
            }
          }, config.redirectDelayMs)
        }

        return
      }

      if (config.mode === "script") {
        writeConstelLoadingPage(
          tab,
          `Conectando na ${config.providerLabel}...`,
          "Estamos autenticando seu acesso e preparando a abertura do sistema."
        )

        const launchTarget = useHelperWindow && helperWindow ? helperWindow : tab
        let hasInjectedScript = false

        const injectLoginScript = () => {
          if (hasInjectedScript || launchTarget.closed) {
            return
          }

          hasInjectedScript = true

          try {
            launchTarget.location.replace(config.scriptUrl)
          } catch {
            launchTarget.location.href = config.scriptUrl
          }
        }

        launchTarget.addEventListener(
          "load",
          () => {
            window.setTimeout(injectLoginScript, 80)
          },
          { once: true }
        )

        try {
          launchTarget.location.replace(config.startUrl)
        } catch {
          launchTarget.location.href = config.startUrl
        }

        window.setTimeout(
          injectLoginScript,
          Math.max(config.redirectDelayMs - 500, 900)
        )

        if (useHelperWindow && helperWindow) {
          window.setTimeout(() => {
            if (!tab.closed) {
              try {
                tab.location.replace(config.redirectUrl)
              } catch {
                tab.location.href = config.redirectUrl
              }
            }

            helperWindow.close()
          }, config.redirectDelayMs + 150)
        } else {
          window.setTimeout(injectLoginScript, config.redirectDelayMs)
        }

        return
      }

      writeConstelLoadingPage(
        tab,
        `Conectando na ${config.providerLabel}...`,
        "Estamos autenticando seu acesso e abrindo a lista de chamados."
      )

      const form = document.createElement("form")
      form.method = "POST"
      form.action = config.loginUrl
      form.target = useHelperWindow ? helperName : tabName
      form.style.display = "none"

      let hasRedirected = false
      const redirectToTicket = () => {
        if (hasRedirected || tab.closed) {
          return
        }

        hasRedirected = true

        if (helperWindow && !helperWindow.closed) {
          helperWindow.close()
        }

        try {
          tab.location.replace(config.redirectUrl)
        } catch {
          tab.location.href = config.redirectUrl
        }
      }

      const handleLoginLoad = () => {
        window.setTimeout(redirectToTicket, 40)
      }

      if (useHelperWindow && helperWindow) {
        helperWindow.addEventListener("load", handleLoginLoad, { once: true })
      } else {
        tab.addEventListener("load", handleLoginLoad, { once: true })
      }

      Object.entries(config.fields).forEach(([name, value]) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
      form.remove()

      window.setTimeout(redirectToTicket, config.redirectDelayMs)
    } catch (error) {
      if (helperWindow && !helperWindow.closed) {
        helperWindow.close()
      }
      tab.close()
      showInfoToast(error instanceof Error ? error.message : "Nao foi possivel abrir a extensao.")
    } finally {
      setIsLaunching(false)
    }
  }

  if (disabled) {
    return (
      <div
        className={`${className} cursor-default opacity-90`}
        aria-disabled="true"
      >
        {children}
      </div>
    )
  }

  if (provider) {
    return (
      <button
        type="button"
        onClick={handleProviderLaunch}
        className={`${className} ${isLaunching ? "cursor-wait" : "cursor-pointer"}`}
        aria-busy={isLaunching}
      >
        {children}
      </button>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  )
}
