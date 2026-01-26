"use client"

import { useState } from "react"
import { Server, Monitor, Bot, FileText, Printer, DollarSign, Wrench, Wifi } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const sistemas = [
  { id: "ecalc", nome: "Ecalc", logo: "/sistemas/ecalc.png" },
  { id: "idsecure", nome: "IDSecure", logo: "/sistemas/idsecure.jpg" },
  { id: "mercos", nome: "Mercos", logo: "/sistemas/mercos.png" },
  { id: "ploomes", nome: "Ploomes", logo: "/sistemas/ploomes.png" },
  { id: "questor", nome: "Questor", logo: "/sistemas/questor.png" },
  { id: "sankhya", nome: "Sankhya", logo: "/sistemas/sankhya.png" },
  { id: "estoque", nome: "Sistema de Estoque", logo: "/sistemas/estoque.png" },
]

const automacoes = [
  { id: "dogking", nome: "Dog King", logo: "/sistemas/dogking.png" },
  { id: "ploomes_auto", nome: "Ploomes", logo: "/sistemas/ploomes.png" },
  { id: "thebestacai", nome: "The Best Açaí", logo: "/sistemas/thebestacai.png" },
]

interface SelectSectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSector: (sector: "infra" | "sistemas") => void
  onSelectInfraCategory?: (category: "impressora" | "orcamento" | "manutencao" | "wifi" | "outros") => void
  onSelectSistemasCategory?: (category: "sistemas" | "automacao" | "relatorios") => void
  onSelectSistema?: (sistemaId: string) => void
  onSelectAutomacao?: (automacaoId: string) => void
}

export function SelectSectorDialog({ 
  open, 
  onOpenChange, 
  onSelectSector,
  onSelectInfraCategory,
  onSelectSistemasCategory,
  onSelectSistema,
  onSelectAutomacao
}: SelectSectorDialogProps) {
  const [showInfraCategories, setShowInfraCategories] = useState(false)
  const [showSistemasCategories, setShowSistemasCategories] = useState(false)
  const [showSistemasList, setShowSistemasList] = useState(false)
  const [showAutomacaoList, setShowAutomacaoList] = useState(false)

  const handleInfraClick = () => {
    setShowInfraCategories(true)
    setShowSistemasCategories(false)
    setShowSistemasList(false)
    setShowAutomacaoList(false)
  }

  const handleSistemasClick = () => {
    setShowSistemasCategories(true)
    setShowInfraCategories(false)
  }

  const handleInfraCategoryClick = (category: "impressora" | "orcamento" | "manutencao" | "wifi" | "outros") => {
    onSelectInfraCategory?.(category)
    setShowInfraCategories(false)
  }

  const handleCategoryClick = (category: "sistemas" | "automacao" | "relatorios") => {
    if (category === "sistemas") {
      // Mostra a lista de sistemas
      setShowSistemasList(true)
      setShowAutomacaoList(false)
    } else if (category === "automacao") {
      // Mostra a lista de automações
      setShowAutomacaoList(true)
      setShowSistemasList(false)
    } else {
      // Para outras categorias, chama o callback
      onSelectSistemasCategory?.(category)
      setShowSistemasCategories(false)
      setShowSistemasList(false)
      setShowAutomacaoList(false)
    }
  }

  const handleSistemaClick = (sistemaId: string) => {
    onSelectSistema?.(sistemaId)
    setShowSistemasCategories(false)
    setShowSistemasList(false)
    setShowAutomacaoList(false)
  }

  const handleAutomacaoClick = (automacaoId: string) => {
    onSelectAutomacao?.(automacaoId)
    setShowSistemasCategories(false)
    setShowSistemasList(false)
    setShowAutomacaoList(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowInfraCategories(false)
      setShowSistemasCategories(false)
      setShowSistemasList(false)
      setShowAutomacaoList(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 border-0">
        {/* Header com fundo escuro */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 text-white rounded-t-lg">
          <DialogTitle className="text-3xl font-bold mb-2">Selecione o Setor</DialogTitle>
          <DialogDescription className="text-slate-300 text-base">
            Escolha qual setor da T.I. você deseja abrir o chamado
          </DialogDescription>
        </div>
        
        <div className="flex flex-col gap-6 p-8">
          {/* Cards principais - Infraestrutura e Sistemas */}
          <div className="grid grid-cols-2 gap-6">
            <button
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                showInfraCategories 
                  ? "border-blue-500 bg-blue-50 shadow-lg" 
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={handleInfraClick}
            >
              {showInfraCategories && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Server className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Infraestrutura</h3>
                  <p className="text-sm text-gray-500">Rede, hardware, impressora</p>
                </div>
              </div>
            </button>

            <button
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                showSistemasCategories 
                  ? "border-blue-500 bg-blue-50 shadow-lg" 
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={handleSistemasClick}
            >
              {showSistemasCategories && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Sistemas</h3>
                  <p className="text-sm text-gray-500">ERP, automação, aplicações</p>
                </div>
              </div>
            </button>
          </div>

          {/* Subcategorias de Infraestrutura */}
          {showInfraCategories && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-semibold text-gray-700">Subcategorias de Infraestrutura</h4>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <button
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleInfraCategoryClick("impressora")}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Printer className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-sm text-gray-900">Impressora</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">Problemas com<br />impressão</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleInfraCategoryClick("orcamento")}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-sm text-gray-900">Orçamento</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">Solicitação de<br />orçamento</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleInfraCategoryClick("manutencao")}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Wrench className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-sm text-gray-900">Manutenção</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">Manutenção de<br />equipamento</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleInfraCategoryClick("wifi")}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Wifi className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-sm text-gray-900">Wi-Fi</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">Problemas de<br />conexão</p>
                    </div>
                  </div>
                </button>

                <button
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleInfraCategoryClick("outros")}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Server className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-sm text-gray-900">Outros</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">Outros<br />problemas</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Categorias de Sistemas - aparecem quando Sistemas é clicado */}
          {showSistemasCategories && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <Button
                variant="outline"
                className={`h-28 flex flex-col gap-2 transition-all ${
                  showSistemasList
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary hover:bg-primary/5"
                }`}
                onClick={() => handleCategoryClick("sistemas")}
              >
                <Monitor className="w-8 h-8 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs">Sistemas</span>
                  <span className="text-[10px] text-muted-foreground text-center">ERP e aplicações</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className={`h-28 flex flex-col gap-2 transition-all ${
                  showAutomacaoList
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary hover:bg-primary/5"
                }`}
                onClick={() => handleCategoryClick("automacao")}
              >
                <Bot className="w-8 h-8 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs">Automação</span>
                  <span className="text-[10px] text-muted-foreground text-center">Processos automatizados</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-28 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handleCategoryClick("relatorios")}
              >
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs">Relatórios</span>
                  <span className="text-[10px] text-muted-foreground text-center">Solicitação de relatórios</span>
                </div>
              </Button>
            </div>
          )}

          {/* Lista de Sistemas - aparecem quando a categoria Sistemas é clicada */}
          {showSistemasList && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t">
              {sistemas.map((sistema) => (
                <Button
                  key={sistema.id}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all p-2"
                  onClick={() => handleSistemaClick(sistema.id)}
                >
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <Image
                      src={sistema.logo}
                      alt={sistema.nome}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {sistema.nome}
                  </span>
                </Button>
              ))}
            </div>
          )}

          {/* Lista de Automações - aparecem quando a categoria Automação é clicada */}
          {showAutomacaoList && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              {automacoes.map((automacao) => (
                <Button
                  key={automacao.id}
                  variant="outline"
                  className="h-28 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all p-3"
                  onClick={() => handleAutomacaoClick(automacao.id)}
                >
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    <Image
                      src={automacao.logo}
                      alt={automacao.nome}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {automacao.nome}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
