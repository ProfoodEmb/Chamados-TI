import { TicketCounter } from "@/components/ticket-counter"
import { NoticeBoard } from "@/components/notice-board"

export default function Home() {
  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-lg md:text-xl font-semibold text-foreground mb-0.5">Olá, Jackson Felipe</h1>
        <p className="text-sm text-muted-foreground">Que bom te ver por aqui! :)</p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Para acessar os contadores de tickets é só expandir os indicadores que deseja visualizar e utilizar
          normalmente
        </p>
      </div>

      {/* Grid - Meus tickets e Mural de avisos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TicketCounter />
        <NoticeBoard />
      </div>
    </div>
  )
}
