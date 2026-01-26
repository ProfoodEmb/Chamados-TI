"use client"

import Link from "next/link"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NoticeBoard() {
  const notices = [
    {
      title: "Manutenção programada",
      description: "O sistema estará indisponível no dia 28/01 das 22h de 02h.",
      time: "Hoje",
    },
    {
      title: "Nova versão disponível",
      description: "Atualizamos o módulo de relatórios com novos recursos.",
      time: "Ontem",
    },
  ]

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Mural de avisos</h2>
          <p className="text-xs text-muted-foreground">Fique por dentro das novidades</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {notices.map((notice, index) => (
          <Link key={index} href="/avisos">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {notice.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {notice.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {notice.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/avisos">
        <Button
          variant="outline"
          className="w-full text-sm hover:bg-accent"
        >
          Ver todos os avisos
        </Button>
      </Link>
    </div>
  )
}
