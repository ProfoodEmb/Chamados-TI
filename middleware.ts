import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware - pathname:', pathname)

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    "/login", 
    "/api/auth",
    "/api/tickets/events" // SSE para real-time
  ]
  
  // Rotas públicas apenas em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    publicRoutes.push("/api/test-whatsapp")
  }
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar se há um token de sessão
  const sessionToken = request.cookies.get("better-auth.session_token")
  
  if (!sessionToken) {
    // Redirecionar para login se não houver sessão
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Proteger rotas /ti/* - apenas para equipe T.I.
  if (pathname.startsWith("/ti")) {
    // Buscar role do cookie de sessão usando Better Auth
    try {
      const { auth } = await import("@/lib/auth/auth")
      const session = await auth.api.getSession({
        headers: request.headers
      })

      if (session?.user) {
        const userRole = session.user.role || ""
        
        // Apenas admin, líderes e funcionários da TI podem acessar /ti
        const allowedRoles = ["admin", "lider_infra", "func_infra", "lider_sistemas", "func_sistemas"]
        const hasAccess = allowedRoles.some(role => userRole.includes(role) || userRole === role)
        
        if (!hasAccess) {
          console.log(`🚫 Acesso negado a /ti para role: ${userRole}`)
          return NextResponse.redirect(new URL("/", request.url))
        }
      } else {
        // Sem sessão, redirecionar para home
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      console.error("Erro ao verificar permissões:", error)
      // Em caso de erro, permitir acesso (será bloqueado pela API se necessário)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
