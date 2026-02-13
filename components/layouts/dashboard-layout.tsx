"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layouts/sidebar"
import { Header } from "@/components/layouts/header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isAvisosPage = pathname === "/avisos"

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isAvisosPage) {
    return (
      <>
        <Sidebar />
        <Header />
        <main className="ml-0 md:ml-16 transition-all duration-300 h-screen flex flex-col">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-0 md:ml-16 pt-16 transition-all duration-300 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </>
  )
}
