import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/api/auth"]
  
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
    // Aqui poderíamos verificar o role do usuário, mas isso requer uma chamada ao banco
    // Por enquanto, vamos deixar a verificação no client-side
    // TODO: Implementar verificação de role no servidor
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
