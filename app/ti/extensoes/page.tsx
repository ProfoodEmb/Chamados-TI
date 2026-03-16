import { Header } from "@/components/layouts/header"
import { Sidebar } from "@/components/layouts/sidebar"
import { ExternalLink, Puzzle } from "lucide-react"

interface Extension {
  id: string
  name: string
  description: string
  url: string
  icon: string
  category: string
}

const extensions: Extension[] = [
  {
    id: "1",
    name: "Constel",
    description: "Provedor de serviços de TI",
    url: "#",
    icon: "/sistemas/constel.png",
    category: "Suporte"
  },
  {
    id: "2",
    name: "PrintServe",
    description: "Provedor de serviços de TI",
    url: "#",
    icon: "/sistemas/printserve.png",
    category: "Suporte"
  },
  {
    id: "3",
    name: "Heidelberg",
    description: "Provedor de serviços de TI",
    url: "#",
    icon: "/sistemas/Heidelberg1.png",
    category: "Suporte"
  },
]

export default function ExtensoesPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Extensões</h1>
                  <p className="text-gray-500">Acesso rápido a aplicações e sites externos</p>
                </div>
              </div>
            </div>

            {/* Grid de Extensões */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {extensions.map((ext) => {
                const isConstel = ext.name === "Constel"
                const isPrintServe = ext.name === "PrintServe"
                const isHeidelberg = ext.name === "Heidelberg"

                return (
                  <a
                    key={ext.id}
                    href={ext.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative bg-white rounded-xl border-2 border-gray-200 p-8 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      isConstel
                        ? "hover:border-[#008b8b] before:absolute before:inset-0 before:bg-[#008b8b] before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300"
                        : isPrintServe
                          ? "hover:border-gray-500 before:absolute before:inset-0 before:bg-gray-500 before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300"
                          : isHeidelberg
                            ? "hover:border-[#4b4fd1]"
                            : "hover:border-primary"
                    }`}
                  >
                    {isHeidelberg && (
                      <>
                        <div className="absolute inset-0 z-0 bg-[#4749c7] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="absolute left-[-4%] top-[-3%] z-0 h-[35%] w-[76%] origin-top-left scale-95 rounded-[2.3rem] bg-[#28b446] opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100" />
                        <div className="absolute left-[-4%] top-[24%] z-0 h-[39%] w-[75%] origin-left scale-95 rounded-[2.3rem] bg-[#ffe900] opacity-0 transition-all duration-500 ease-out delay-75 group-hover:scale-100 group-hover:opacity-100" />
                        <div className="absolute left-[-5%] bottom-[-4%] z-0 h-[43%] w-[79%] origin-bottom-left scale-95 rounded-[2.3rem] rounded-tl-[0.9rem] bg-[#1c9cd8] opacity-0 transition-all duration-500 ease-out delay-100 group-hover:scale-100 group-hover:opacity-100" />
                        <div className="absolute right-[-11%] top-[-4%] z-0 h-[108%] w-[46%] origin-right scale-95 rounded-[2.7rem] bg-[#4749c7] opacity-0 transition-all duration-500 ease-out delay-150 group-hover:scale-100 group-hover:opacity-100" />
                      </>
                    )}

                    <div className={`relative z-10 ${isHeidelberg ? "px-5 py-6" : ""}`}>
                      {/* Ícone */}
                      <div className="flex flex-col items-center mb-6 relative">
                        <div className={`flex items-center justify-center mb-4 ${isConstel || isPrintServe || isHeidelberg ? 'w-36 h-36' : 'w-24 h-24'}`}>
                          <img
                            src={ext.icon}
                            alt={ext.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {!isHeidelberg && (
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors absolute top-6 right-6" />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="text-center">
                        <h3
                          className={`mb-2 inline-block text-lg transition-all ${
                            isHeidelberg
                              ? "rounded-full bg-white/78 px-4 py-1 font-bold text-slate-950 shadow-sm backdrop-blur-[2px]"
                              : "font-semibold text-gray-900 group-hover:text-primary"
                          }`}
                        >
                          {ext.name}
                        </h3>
                        {!isHeidelberg && (
                          <>
                            <p className="mb-4 text-sm text-gray-500">{ext.description}</p>
                            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {ext.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Mensagem de rodapé */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Clique em qualquer extensão para abrir em uma nova aba. 
                Entre em contato com a T.I. para adicionar novos aplicativos.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
