import Link from "next/link"
import { NoticeBoard } from "@/components/notice-board"

export default function Home() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1 flex items-center gap-2">
          Olá, Jackson Felipe 
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Que bom te ver por aqui! Acompanhe seus chamados e avisos abaixo.
        </p>
      </div>

      {/* Grid - Meus chamados recentes e Mural de avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Meus Chamados Recentes */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Meus chamados</h2>
                <p className="text-xs text-muted-foreground">0 chamados</p>
              </div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              0 ativos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Nenhum chamado ainda */}
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">Nenhum chamado ainda</h3>
              <p className="text-xs text-muted-foreground mb-4">Crie seu primeiro chamado clicando no botão acima</p>
            </div>
          </div>

          <Link href="/tickets">
            <button className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors">
              Ver todos os chamados
            </button>
          </Link>
        </div>

        {/* Mural de Avisos */}
        <NoticeBoard />
      </div>
    </div>
  )
}
