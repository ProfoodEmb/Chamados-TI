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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=SN+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
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
