"use client"

import { useEffect, useState } from "react"
import { UsersManagement } from "@/components/users-management"

export default function UsuariosPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          setUser(session.user)
          
          // Verificar se é líder de infraestrutura ou admin
          if (session.user.role !== "lider_infra" && session.user.role !== "admin") {
            window.location.href = "/ti"
            return
          }
        } else {
          window.location.href = "/login"
          return
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        window.location.href = "/login"
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== "lider_infra" && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas líderes de infraestrutura podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <UsersManagement currentUser={user} />
    </div>
  )
}