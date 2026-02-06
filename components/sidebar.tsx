"use client"

import { useState, useEffect } from "react"
import { Home, Ticket, LayoutGrid, Settings, BarChart3, Users, Megaphone, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  team: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error)
      }
    }

    fetchUser()
  }, [])

  // Definir itens do menu baseado no tipo de usuário
  const getMenuItems = () => {
    if (!user) return []

    const isTIUser = user.role === "admin" || 
                     user.role === "lider_infra" || 
                     user.role === "func_infra" || 
                     user.role === "lider_sistemas" || 
                     user.role === "func_sistemas"

    if (isTIUser) {
      // Menu para usuários T.I.
      const baseItems = [
        {
          icon: BarChart3,
          href: "/ti",
          label: "Dashboard T.I.",
        },
        {
          icon: LayoutGrid,
          href: "/ti/kanban",
          label: "Kanban",
        },
        {
          icon: Ticket,
          href: "/tickets",
          label: "Chamados",
        },
      ]

      // Adicionar "Avisos" para todos os usuários T.I.
      baseItems.push({
        icon: Megaphone,
        href: "/criar-aviso",
        label: "Avisos",
      })

      // Adicionar "Métricas" para líderes e admin
      if (user.role === "admin" || user.role === "lider_infra" || user.role === "lider_sistemas") {
        baseItems.push({
          icon: TrendingUp,
          href: "/ti/metricas",
          label: "Métricas",
        })
      }

      // Adicionar "Usuários" apenas para lider_infra
      if (user.role === "lider_infra") {
        baseItems.push({
          icon: Users,
          href: "/ti/usuarios",
          label: "Usuários",
        })
      }

      return baseItems
    } else {
      // Menu para usuários comuns
      return [
        {
          icon: Home,
          href: "/",
          label: "Início",
        },
        {
          icon: Ticket,
          href: "/tickets",
          label: "Meus Chamados",
        },
        {
          icon: Megaphone,
          href: "/criar-aviso",
          label: "Avisos",
        },
      ]
    }
  }

  const menuItems = getMenuItems()

  // Evitar erro de hidratação renderizando apenas no cliente
  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-16 bg-primary flex-col items-center py-6 gap-6 z-50 hidden md:flex">
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center mb-4">
          <Ticket className="w-6 h-6 text-primary-foreground" />
        </div>
      </aside>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-primary flex-col items-center py-6 gap-6 z-50 hidden md:flex">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center mb-4">
        <Ticket className="w-6 h-6 text-primary-foreground" />
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          // Verificar se é a rota exata ou se é uma subrota (mas não conflitar com /ti e /ti/kanban)
          const isActive = pathname === item.href || 
            (item.href !== "/" && item.href !== "/ti" && pathname?.startsWith(item.href + "/"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="mt-auto">
        <Link
          href="/settings"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  )
}
