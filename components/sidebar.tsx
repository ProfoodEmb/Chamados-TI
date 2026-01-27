"use client"

import { Home, Ticket, LayoutGrid, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
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

export function Sidebar() {
  const pathname = usePathname()

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
