"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layouts/header"
import { Sidebar } from "@/components/layouts/sidebar"
import { Button } from "@/components/ui/button"
import { MetricsDashboard } from "@/components/features/metrics/metrics-dashboard"
import { RefreshCw, Download, Calendar } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
}

export default function MetricasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90d")

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          const userRole = session.user.role
          const authorized = userRole === "admin" || 
                           userRole === "lider_infra" || 
                           userRole === "lider_sistemas"
          
          if (!authorized) {
            window.location.href = "/ti"
            return
          }
          
          setUser(session.user)
          setIsAuthorized(true)
          
          // Definir filtro padrão baseado no papel do usuário
          // Mas permitir que vejam outros setores
          if (userRole === "lider_sistemas") {
            setTeamFilter("sistemas")
          } else if (userRole === "lider_infra") {
            setTeamFilter("infra")
          } else if (userRole === "admin") {
            setTeamFilter("all")
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        window.location.href = "/ti"
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleExport = () => {
    // TODO: Implementar exportação de relatório
    alert("Funcionalidade de exportação será implementada em breve!")
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setPeriodDialogOpen(false)
    setRefreshKey(prev => prev + 1)
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "7d":
        return "Últimos 7 dias"
      case "30d":
        return "Últimos 30 dias"
      case "90d":
        return "Últimos 3 meses"
      default:
        return "Últimos 3 meses"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando métricas...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 md:pl-16">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Métricas e Relatórios</h1>
                  <p className="text-muted-foreground">
                    Dashboard completo de performance e estatísticas dos chamados
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Filtro de equipe para líderes e admin */}
                  {(user.role === "admin" || user.role === "lider_infra" || user.role === "lider_sistemas") && (
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className="w-70">
                        <SelectValue placeholder="Filtrar por setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Setores</SelectItem>
                        <SelectItem value="infra">Infraestrutura</SelectItem>
                        <SelectItem value="sistemas">Sistemas</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExport}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPeriodDialogOpen(true)}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {getPeriodLabel()}
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard de Métricas */}
            <MetricsDashboard key={refreshKey} teamFilter={teamFilter} period={selectedPeriod} />
          </div>
        </main>
      </div>

      {/* Dialog de Período */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Período</DialogTitle>
            <DialogDescription>
              Escolha o período para visualizar as métricas
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            <Button
              variant={selectedPeriod === "7d" ? "default" : "outline"}
              onClick={() => handlePeriodChange("7d")}
              className="justify-start"
            >
              Últimos 7 dias
            </Button>
            <Button
              variant={selectedPeriod === "30d" ? "default" : "outline"}
              onClick={() => handlePeriodChange("30d")}
              className="justify-start"
            >
              Últimos 30 dias
            </Button>
            <Button
              variant={selectedPeriod === "90d" ? "default" : "outline"}
              onClick={() => handlePeriodChange("90d")}
              className="justify-start"
            >
              Últimos 3 meses
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}