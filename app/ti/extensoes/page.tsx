import { Header } from "@/components/layouts/header"
import { Sidebar } from "@/components/layouts/sidebar"
import { ExtensionCardLink } from "@/components/features/extensions/extension-card-link"
import { ExternalLink, Puzzle } from "lucide-react"

interface Extension {
  id: string
  name: string
  description: string
  url: string
  icon: string
  category: string
  provider?: "constel" | "printserve"
}

const heidelbergWhatsappUrl = `https://web.whatsapp.com/send?phone=5511910478802&text=${encodeURIComponent(
  "Olá, preciso abrir um chamado para a Heidelberg pela Tuicial."
)}`

const ipcomWaveLayers = [
  { size: "92%", offset: "-46%", color: "#3d57df", borderWidth: "10px", delay: "" },
  { size: "130%", offset: "-65%", color: "#22327e", borderWidth: "10px", delay: "delay-75" },
  { size: "172%", offset: "-86%", color: "#ff7a1a", borderWidth: "12px", delay: "delay-100" },
  { size: "218%", offset: "-109%", color: "#f28a00", borderWidth: "12px", delay: "delay-150" },
  { size: "266%", offset: "-133%", color: "#22327e", borderWidth: "12px", delay: "delay-200" },
  { size: "314%", offset: "-157%", color: "#ff9e1b", borderWidth: "11px", delay: "delay-300" },
  { size: "356%", offset: "-178%", color: "#ffbf30", borderWidth: "10px", delay: "delay-500" },
]

const extensions: Extension[] = [
  {
    id: "1",
    name: "Constel",
    description: "Provedor de serviços de TI",
    url: "https://suporte.constel.com.br/Ticket",
    icon: "/sistemas/constel.png",
    category: "Suporte",
    provider: "constel"
  },
  {
    id: "2",
    name: "PrintServe",
    description: "Provedor de serviços de TI",
    url: "https://psfx.com.br/pws/index.php/pws/Chamados",
    icon: "/sistemas/printserve.png",
    category: "Suporte",
    provider: "printserve"
  },
  {
    id: "3",
    name: "Heidelberg",
    description: "Provedor de serviços de TI",
    url: heidelbergWhatsappUrl,
    icon: "/sistemas/Heidelberg1.png",
    category: "Suporte"
  },
  {
    id: "4",
    name: "IPCOM",
    description: "Provedor de serviços de TI",
    url: "#",
    icon: "/sistemas/IPCOM.png",
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
                const isIpcom = ext.name === "IPCOM"
                const isMinimalCard = isConstel || isPrintServe || isHeidelberg || isIpcom

                return (
                  <ExtensionCardLink
                    key={ext.id}
                    provider={ext.provider}
                    href={ext.url}
                    className={`group relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-xl ${
                      isConstel
                        ? "hover:border-[#008b8b] before:absolute before:inset-0 before:bg-[#008b8b] before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300"
                        : isPrintServe
                          ? "hover:border-gray-500 before:absolute before:inset-0 before:bg-gray-500 before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300"
                          : isHeidelberg
                            ? "hover:border-[#4b4fd1]"
                            : isIpcom
                              ? "hover:border-[#22327e]"
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

                    {isIpcom && (
                      <>
                        <div className="absolute inset-0 z-0 bg-gradient-to-tl from-[#eef3ff] via-white to-[#fff3e2] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {ipcomWaveLayers.map((wave, index) => (
                          <div
                            key={`${wave.size}-${index}`}
                            className={`absolute z-0 origin-bottom-right scale-90 rounded-full border-solid opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 ${wave.delay}`}
                            style={{
                              width: wave.size,
                              height: wave.size,
                              right: wave.offset,
                              bottom: wave.offset,
                              borderColor: wave.color,
                              borderWidth: wave.borderWidth,
                              transformOrigin: "bottom right",
                            }}
                          />
                        ))}
                      </>
                    )}

                    <div className={`relative z-10 flex w-full flex-col items-center justify-center ${isMinimalCard ? "min-h-[260px] px-5 py-6" : ""}`}>
                      {/* Ícone */}
                      <div className={`relative flex flex-col items-center ${isMinimalCard ? "mb-10" : "mb-6"}`}>
                        <div className={`flex items-center justify-center mb-4 ${isConstel || isPrintServe || isHeidelberg || isIpcom ? 'w-36 h-36' : 'w-24 h-24'}`}>
                          <img
                            src={ext.icon}
                            alt={ext.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {!isHeidelberg && !isPrintServe && !isConstel && !isIpcom && (
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors absolute top-6 right-6" />
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="w-full text-center">
                        <h3
                          className={`mb-2 inline-block text-lg transition-all ${
                            isMinimalCard
                              ? "rounded-full bg-white/78 px-4 py-1 font-bold text-slate-950 shadow-sm backdrop-blur-[2px]"
                              : "font-semibold text-gray-900 group-hover:text-primary"
                          }`}
                        >
                          {ext.name}
                        </h3>
                        {!isHeidelberg && !isPrintServe && !isConstel && !isIpcom && (
                          <>
                            <p className={`mb-4 text-sm ${isIpcom ? "inline-block rounded-full bg-white/72 px-4 py-1.5 font-medium text-slate-800 shadow-sm backdrop-blur-[2px]" : "text-gray-500"}`}>{ext.description}</p>
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${isIpcom ? "bg-white/40 text-slate-950 shadow-sm backdrop-blur-[2px]" : "bg-primary/10 text-primary"}`}>
                              {ext.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </ExtensionCardLink>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
