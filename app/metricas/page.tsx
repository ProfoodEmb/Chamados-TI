"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layouts/header"
import { Sidebar } from "@/components/layouts/sidebar"
import { Button } from "@/components/ui/button"
import { MetricsDashboard } from "@/components/features/metrics/metrics-dashboard"
import { RefreshCw, Calendar } from "lucide-react"
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
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90d")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          const userRole = session.user.role
          const authorized = userRole === "func_infra" || 
                           userRole === "lider_infra" ||
                           userRole === "func_sistemas" ||
                           userRole === "lider_sistemas" ||
                           userRole === "admin"
          
          if (!authorized) {
            window.location.href = "/"
            return
          }
          
          setUser(session.user)
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        window.location.href = "/"
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== "custom") {
      setCustomStartDate("")
      setCustomEndDate("")
      setPeriodDialogOpen(false)
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleCustomPeriodApply = () => {
    if (customStartDate && customEndDate) {
      setPeriodDialogOpen(false)
      setRefreshKey(prev => prev + 1)
    }
  }

  const getPeriodLabel = () => {
    if (selectedPeriod === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const end = new Date(customEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      return `${start} - ${end}`
    }
    
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

  const getPeriodParams = () => {
    if (selectedPeriod === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate }
    }
    return { period: selectedPeriod }
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

  // Determinar o filtro de equipe baseado no usuário
  const teamFilter = user.team === "infra" ? "infra" : 
                    user.team === "sistemas" ? "sistemas" : 
                    "all"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Métricas</h1>
                  <p className="text-muted-foreground">
                    Dashboard de performance e estatísticas dos chamados
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
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
            <MetricsDashboard 
              key={refreshKey} 
              teamFilter={teamFilter} 
              {...getPeriodParams()}
            />
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
            
            <div className="border-t pt-3 mt-2">
              <Button
                variant={selectedPeriod === "custom" ? "default" : "outline"}
                onClick={() => handlePeriodChange("custom")}
                className="justify-start w-full mb-3"
              >
                Período Personalizado
              </Button>
              
              {selectedPeriod === "custom" && (
                <div className="space-y-3 pl-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data Inicial</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      max={customEndDate || undefined}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data Final</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      min={customStartDate || undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialogOpen(false)}>
              Cancelar
            </Button>
            {selectedPeriod === "custom" && (
              <Button 
                onClick={handleCustomPeriodApply}
                disabled={!customStartDate || !customEndDate}
              >
                Aplicar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
