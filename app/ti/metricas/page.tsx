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
          
          // Auto-definir filtro de equipe para lider_sistemas
          if (userRole === "lider_sistemas") {
            setTeamFilter("sistemas")
          } else if (userRole === "lider_infra") {
            setTeamFilter("infra")
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
                  {/* Mostrar filtro de equipe apenas para admin */}
                  {user.role === "admin" && (
                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Filtrar por equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Departamentos</SelectItem>
                        <SelectItem value="infra">Departamento de Infraestrutura</SelectItem>
                        <SelectItem value="sistemas">Departamento de Sistemas</SelectItem>
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
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Período
                  </Button>
                </div>
              </div>
            </div>

            {/* Dashboard de Métricas */}
            <MetricsDashboard key={refreshKey} teamFilter={teamFilter} />
          </div>
        </main>
      </div>
    </div>
  )
}