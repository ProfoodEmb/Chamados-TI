import { TicketCounter } from "@/components/ticket-counter"
import { NoticeBoard } from "@/components/notice-board"

export default function Home() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Olá, Jackson Felipe</h1>
        <p className="text-muted-foreground">Que bom te ver por aqui! :)</p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Para acessar os contadores de tickets é só expandir os indicadores que deseja visualizar e utilizar
          normalmente
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6">
        <TicketCounter />
      </div>

      {/* Notice Board */}
      <div className="max-w-full md:max-w-2xl">
        <NoticeBoard />
      </div>
    </div>
  )
}
