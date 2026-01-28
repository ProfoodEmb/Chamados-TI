import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sistema de Chamados",
  description: "Faça login no sistema de chamados",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

