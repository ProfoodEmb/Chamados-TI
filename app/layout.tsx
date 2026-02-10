"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { usePathname } from "next/navigation"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <div className="min-h-screen bg-background">
          {!isLoginPage && (
            <>
              <Sidebar />
              <Header />
            </>
          )}
          <main className={isLoginPage ? "" : "ml-0 md:ml-16 pt-16 transition-all duration-300 h-screen flex flex-col"}>
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
