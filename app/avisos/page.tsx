import { Megaphone, Calendar, Clock } from "lucide-react"

export default function AvisosPage() {
  const avisos = [
    {
      id: 1,
      title: "Manutenção programada",
      description: "O sistema estará indisponível no dia 28/01 das 22h de 02h. Durante este período, realizaremos atualizações importantes de segurança e performance.",
      date: "26/01/2026",
      time: "Hoje",
      category: "Manutenção",
      priority: "high",
    },
    {
      id: 2,
      title: "Nova versão disponível",
      description: "Atualizamos o módulo de relatórios com novos recursos. Agora você pode exportar relatórios em mais formatos e aplicar filtros avançados.",
      date: "25/01/2026",
      time: "Ontem",
      category: "Atualização",
      priority: "medium",
    },
    {
      id: 3,
      title: "Treinamento sobre novo sistema",
      description: "Será realizado um treinamento sobre o novo módulo de automação no dia 30/01 às 14h. Inscrições abertas até 28/01.",
      date: "24/01/2026",
      time: "2 dias atrás",
      category: "Treinamento",
      priority: "medium",
    },
    {
      id: 4,
      title: "Atualização de segurança aplicada",
      description: "Aplicamos patches de segurança importantes em todos os sistemas. Nenhuma ação é necessária por parte dos usuários.",
      date: "23/01/2026",
      time: "3 dias atrás",
      category: "Segurança",
      priority: "low",
    },
    {
      id: 5,
      title: "Novo sistema de backup implementado",
      description: "Implementamos um novo sistema de backup automático. Seus dados agora são salvos a cada 4 horas automaticamente.",
      date: "22/01/2026",
      time: "4 dias atrás",
      category: "Infraestrutura",
      priority: "low",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 border-red-200 text-red-700"
      case "medium":
        return "bg-yellow-100 border-yellow-200 text-yellow-700"
      case "low":
        return "bg-green-100 border-green-200 text-green-700"
      default:
        return "bg-gray-100 border-gray-200 text-gray-700"
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mural de Avisos</h1>
            <p className="text-sm text-muted-foreground">
              Fique por dentro de todas as novidades e atualizações
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Avisos */}
      <div className="space-y-4">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${getPriorityColor(aviso.priority)}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/50">
                    {aviso.category}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {aviso.title}
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {aviso.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-current/20">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{aviso.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{aviso.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
