"use client"

import { useState, useEffect } from "react"
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

export default function ExtensoesPage() {
  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: "1",
      name: "Google Drive",
      description: "Armazenamento e compartilhamento de arquivos",
      url: "https://drive.google.com",
      icon: "🗂️",
      category: "Produtividade"
    },
    {
      id: "2",
      name: "Gmail",
      description: "E-mail corporativo",
      url: "https://mail.google.com",
      icon: "📧",
      category: "Comunicação"
    },
    {
      id: "3",
      name: "GitHub",
      description: "Repositório de código",
      url: "https://github.com",
      icon: "💻",
      category: "Desenvolvimento"
    },
    {
      id: "4",
      name: "Trello",
      description: "Gerenciamento de projetos",
      url: "https://trello.com",
      icon: "📋",
      category: "Produtividade"
    },
    {
      id: "5",
      name: "Constel",
      description: "Provedor de serviços de TI",
      url: "#",
      icon: "�️",
      category: "Suporte"
    },
    {
      id: "6",
      name: "PrintServe",
      description: "Provedor de serviços de TI",
      url: "#",
      icon: "�️",
      category: "Suporte"
    },
    {
      id: "7",
      name: "Heidelberg",
      description: "Provedor de serviços de TI",
      url: "#",
      icon: "⚙️",
      category: "Suporte"
    },
  ])

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
                  <h1 className="text-3xl font-bold text-gray-900">Extensões (7 itens)</h1>
                  <p className="text-gray-500">Acesso rápido a aplicações e sites externos</p>
                </div>
              </div>
            </div>

            {/* Grid de Extensões */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {extensions.map((ext) => (
                <a
                  key={ext.id}
                  href={ext.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                  {/* Ícone */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      {ext.icon.startsWith('/') ? (
                        <img 
                          src={ext.icon} 
                          alt={ext.name}
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <span className="text-4xl">{ext.icon}</span>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {ext.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{ext.description}</p>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {ext.category}
                    </span>
                  </div>
                </a>
              ))}
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
