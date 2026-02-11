import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Providers } from "@/components/layouts/providers"
import "./globals.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-background">
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
