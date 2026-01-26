"use client"

import { useState } from "react"
import { Search, Clock, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SelectSectorDialog } from "@/components/select-sector-dialog"
import { TicketFormDialog, type TicketFormData } from "@/components/ticket-form-dialog"
import { RelatorioFormDialog, type RelatorioFormData } from "@/components/relatorio-form-dialog"
import { InfraFormDialog, type InfraFormData } from "@/components/infra-form-dialog"

export function Header() {
  const [showSectorDialog, setShowSectorDialog] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showRelatorioForm, setShowRelatorioForm] = useState(false)
  const [showInfraForm, setShowInfraForm] = useState(false)
  const [selectedSistema, setSelectedSistema] = useState<{ id: string; nome: string } | null>(null)
  const [infraCategory, setInfraCategory] = useState<string>("")

  const handleSelectSector = (sector: "infra" | "sistemas") => {
    console.log("Setor selecionado:", sector)
    // Não faz nada aqui, espera a seleção da subcategoria
  }

  const handleSelectInfraCategory = (category: "impressora" | "orcamento" | "manutencao" | "wifi" | "outros") => {
    console.log("Categoria de infraestrutura selecionada:", category)
    setShowSectorDialog(false)
    
    // Mapear categoria para o nome usado no formulário
    const categoryMap: Record<string, string> = {
      impressora: "Impressora",
      orcamento: "Orçamento",
      manutencao: "Manutenção",
      wifi: "Rede e conectividade",
      outros: "Outro problema",
    }
    
    setInfraCategory(categoryMap[category] || "")
    setShowInfraForm(true)
  }

  const handleSelectSistemasCategory = (category: "sistemas" | "automacao" | "relatorios") => {
    console.log("Categoria de sistemas selecionada:", category)
    setShowSectorDialog(false)
    
    if (category === "relatorios") {
      // Abre o formulário de relatórios
      setShowRelatorioForm(true)
    }
  }

  const handleSelectSistema = (sistemaId: string) => {
    console.log("Sistema selecionado:", sistemaId)
    
    // Mapear ID para nome
    const sistemasMap: Record<string, string> = {
      ecalc: "Ecalc",
      idsecure: "IDSecure",
      mercos: "Mercos",
      ploomes: "Ploomes",
      questor: "Questor",
      sankhya: "Sankhya",
      estoque: "Sistema de Estoque",
    }
    
    setSelectedSistema({
      id: sistemaId,
      nome: sistemasMap[sistemaId] || sistemaId
    })
    setShowSectorDialog(false)
    setShowTicketForm(true)
  }

  const handleSelectAutomacao = (automacaoId: string) => {
    console.log("Automação selecionada:", automacaoId)
    
    // Mapear ID para nome
    const automacoesMap: Record<string, string> = {
      dogking: "Dog King",
      ploomes_auto: "Ploomes Automação",
      thebestacai: "The Best Açaí",
    }
    
    setSelectedSistema({
      id: automacaoId,
      nome: automacoesMap[automacaoId] || automacaoId
    })
    setShowSectorDialog(false)
    setShowTicketForm(true)
  }

  const handleTicketSubmit = (data: TicketFormData) => {
    console.log("Chamado criado:", data)
    setShowTicketForm(false)
    setSelectedSistema(null)
    // Aqui você pode enviar os dados para o backend ou adicionar ao estado global
  }

  const handleRelatorioSubmit = (data: RelatorioFormData) => {
    console.log("Relatório solicitado:", data)
    setShowRelatorioForm(false)
    // Aqui você pode enviar os dados para o backend
  }

  const handleInfraSubmit = (data: InfraFormData) => {
    console.log("Chamado de infraestrutura criado:", data)
    setShowInfraForm(false)
    setInfraCategory("")
    // Aqui você pode enviar os dados para o backend
  }

  const handleInfraFormClose = (open: boolean) => {
    setShowInfraForm(open)
    if (!open) {
      setInfraCategory("")
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 md:left-16 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 z-40 transition-all duration-300">
        {/* Left side - Sistema online */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Sistema online</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowSectorDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Chamado
          </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Clock className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarImage src="/abstract-geometric-shapes.png" alt="Jackson Felipe" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">JF</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-foreground">Jackson Felipe</span>
            <span className="text-xs text-muted-foreground">Usuário</span>
          </div>
        </div>
      </div>
    </header>

    <SelectSectorDialog 
      open={showSectorDialog}
      onOpenChange={setShowSectorDialog}
      onSelectSector={handleSelectSector}
      onSelectInfraCategory={handleSelectInfraCategory}
      onSelectSistemasCategory={handleSelectSistemasCategory}
      onSelectSistema={handleSelectSistema}
      onSelectAutomacao={handleSelectAutomacao}
    />

    {selectedSistema && (
      <TicketFormDialog
        open={showTicketForm}
        onOpenChange={setShowTicketForm}
        sistemaId={selectedSistema.id}
        sistemaNome={selectedSistema.nome}
        onSubmit={handleTicketSubmit}
      />
    )}

    <RelatorioFormDialog
      open={showRelatorioForm}
      onOpenChange={setShowRelatorioForm}
      onSubmit={handleRelatorioSubmit}
    />

    <InfraFormDialog
      open={showInfraForm}
      onOpenChange={handleInfraFormClose}
      onSubmit={handleInfraSubmit}
      preSelectedCategory={infraCategory}
    />
  </>
  )
}
