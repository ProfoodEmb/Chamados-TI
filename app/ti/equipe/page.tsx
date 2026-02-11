"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { UsersManagement } from "@/components/users-management"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
}

export default function EquipePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          const userRole = session.user.role
          // Apenas líderes podem acessar
          const authorized = userRole === "lider_infra" || userRole === "lider_sistemas"
          
          if (!authorized) {
            window.location.href = "/ti"
            return
          }
          
          setUser(session.user)
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        window.location.href = "/ti"
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 md:pl-16">
          <div className="p-6">
            <UsersManagement currentUser={user} />
          </div>
        </main>
      </div>
    </div>
  )
}
