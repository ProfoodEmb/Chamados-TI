"use client"

import { useState, useEffect } from "react"
import { Plus, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SelectSectorDialog } from "@/components/features/tickets/select-sector-dialog"
import { TicketFormDialog, type TicketFormData } from "@/components/features/tickets/ticket-form-dialog"
import { RelatorioFormDialog, type RelatorioFormData } from "@/components/features/tickets/relatorio-form-dialog"
import { InfraFormDialog, type InfraFormData } from "@/components/features/tickets/infra-form-dialog"
import { UserProfileDialog } from "@/components/features/users/user-profile-dialog"

interface User {
  id: string
  name: string
  email: string
  role: string
  team: string
}

export function Header() {
  const [showSectorDialog, setShowSectorDialog] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showRelatorioForm, setShowRelatorioForm] = useState(false)
  const [showInfraForm, setShowInfraForm] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [selectedSistema, setSelectedSistema] = useState<{ id: string; nome: string } | null>(null)
  const [infraCategory, setInfraCategory] = useState<string>("")
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error)
      }
    }

    fetchUser()
  }, [])

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

  const handleTicketSubmit = async (data: TicketFormData) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `${data.sistemaNome} - ${data.assunto}`,
          description: data.descricao,
          category: "Sistemas",
          urgency: data.urgencia,
          service: data.sistemaNome,
          team: "sistemas",
        }),
      })

      if (response.ok) {
        setShowTicketForm(false)
        setSelectedSistema(null)
        // Emitir evento customizado para atualizar a lista de chamados
        console.log("Disparando evento ticketCreated...")
        window.dispatchEvent(new CustomEvent('ticketCreated'))
      } else {
        console.error("Erro ao criar chamado")
        alert("Erro ao criar chamado. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      alert("Erro ao criar chamado. Tente novamente.")
    }
  }

  const handleRelatorioSubmit = async (data: RelatorioFormData) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `Relatório - ${data.tipoRelatorio}`,
          description: data.descricao,
          category: "Relatórios",
          urgency: "medium", // Padrão para relatórios
          service: "Relatórios",
          team: "sistemas",
        }),
      })

      if (response.ok) {
        setShowRelatorioForm(false)
        // Emitir evento customizado para atualizar a lista de chamados
        console.log("Disparando evento ticketCreated...")
        window.dispatchEvent(new CustomEvent('ticketCreated'))
      } else {
        console.error("Erro ao criar chamado")
        alert("Erro ao criar chamado. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      alert("Erro ao criar chamado. Tente novamente.")
    }
  }

  const handleInfraSubmit = async (data: InfraFormData) => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `${data.problema}${data.patrimonio ? ` - Patrimônio: ${data.patrimonio}` : ''}`,
          description: data.descricao,
          category: "Infraestrutura",
          urgency: data.urgencia,
          service: data.problema,
          team: "infra",
        }),
      })

      if (response.ok) {
        setShowInfraForm(false)
        setInfraCategory("")
        // Emitir evento customizado para atualizar a lista de chamados
        console.log("Disparando evento ticketCreated...")
        window.dispatchEvent(new CustomEvent('ticketCreated'))
      } else {
        console.error("Erro ao criar chamado")
        alert("Erro ao criar chamado. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      alert("Erro ao criar chamado. Tente novamente.")
    }
  }

  const handleInfraFormClose = (open: boolean) => {
    setShowInfraForm(open)
    if (!open) {
      setInfraCategory("")
    }
  }

  const handleLogout = async () => {
    // Usar Better Auth para fazer logout
    const { signOut } = await import("@/lib/auth/auth-client")
    await signOut()
    // Redirecionar para a página de login
    window.location.href = "/login"
  }

  // Evitar erro de hidratação renderizando apenas no cliente
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 md:left-16 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 z-40 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Sistema online</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Novo Chamado
          </Button>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </div>
      </header>
    )
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

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt={user?.name || "Usuário"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{user?.name || "Carregando..."}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role === "admin" ? "Administrador" : 
                     user?.role === "lider_infra" ? "Líder Infra" :
                     user?.role === "func_infra" ? "Funcionário Infra" :
                     user?.role === "lider_sistemas" ? "Líder Sistemas" :
                     user?.role === "func_sistemas" ? "Funcionário Sistemas" :
                     "Usuário"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <User className="w-4 h-4 mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        onBack={() => {
          setShowTicketForm(false)
          setSelectedSistema(null)
          setShowSectorDialog(true)
        }}
      />
    )}

    <RelatorioFormDialog
      open={showRelatorioForm}
      onOpenChange={setShowRelatorioForm}
      onSubmit={handleRelatorioSubmit}
      onBack={() => {
        setShowRelatorioForm(false)
        setShowSectorDialog(true)
      }}
    />

    <InfraFormDialog
      open={showInfraForm}
      onOpenChange={handleInfraFormClose}
      onSubmit={handleInfraSubmit}
      preSelectedCategory={infraCategory}
      onBack={() => {
        setShowInfraForm(false)
        setInfraCategory("")
        setShowSectorDialog(true)
      }}
    />

    <UserProfileDialog
      open={showProfileDialog}
      onOpenChange={setShowProfileDialog}
    />
  </>
  )
}
