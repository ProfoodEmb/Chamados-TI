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
                <p className="text-xs text-muted-foreground">3 chamados recentes</p>
              </div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              2 ativos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Chamado 1 */}
            <Link href="/tickets">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">#28147 Erro ao emitir NF-e</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">2h atrás</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      Em andamento
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Chamado 2 */}
            <Link href="/tickets">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">#28146 Sistema lento no cadastro</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">4h atrás</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      Aberto
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Chamado 3 */}
            <Link href="/tickets">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">#28145 Impressora não conecta</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">1 dia atrás</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      Resolvido
                    </span>
                  </div>
                </div>
              </div>
            </Link>
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
