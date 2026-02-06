"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  AlertTriangle, 
  User, 
  Calendar, 
  Tag,
  RotateCcw
} from "lucide-react"

interface User {
  id: string
  name: string
  role: string
  team: string
}

interface KanbanFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  teamFilter: string
  onTeamFilterChange: (value: string) => void
  urgencyFilter: string
  onUrgencyFilterChange: (value: string) => void
  assigneeFilter: string
  onAssigneeFilterChange: (value: string) => void
  dateFilter: string
  onDateFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  users: User[]
  onClearFilters: () => void
  activeFiltersCount: number
}

export function KanbanFilters({
  searchTerm,
  onSearchChange,
  teamFilter,
  onTeamFilterChange,
  urgencyFilter,
  onUrgencyFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  users,
  onClearFilters,
  activeFiltersCount
}: KanbanFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const teamOptions = [
    { value: "all", label: "Todas as equipes" },
    { value: "infra", label: "Infraestrutura" },
    { value: "sistemas", label: "Sistemas" }
  ]

  const urgencyOptions = [
    { value: "all", label: "Todas as urgências" },
    { value: "critical", label: "Crítica" },
    { value: "high", label: "Alta" },
    { value: "medium", label: "Média" },
    { value: "low", label: "Baixa" }
  ]

  const dateOptions = [
    { value: "all", label: "Todas as datas" },
    { value: "today", label: "Hoje" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mês" }
  ]

  const categoryOptions = [
    { value: "all", label: "Todas as categorias" },
    { value: "Hardware", label: "Hardware" },
    { value: "Software", label: "Software" },
    { value: "Rede", label: "Rede" },
    { value: "Sistema", label: "Sistema" },
    { value: "Impressora", label: "Impressora" },
    { value: "Email", label: "Email" },
    { value: "Telefonia", label: "Telefonia" },
    { value: "Backup", label: "Backup" },
    { value: "Segurança", label: "Segurança" },
    { value: "Outros", label: "Outros" }
  ]

  // Filtrar usuários da equipe de TI com verificação robusta
  const tiUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) {
      console.log('KanbanFilters: users não é um array válido:', users)
      return []
    }
    
    return users.filter(user => 
      user && user.role && (
        user.role === "admin" || 
        user.role === "lider_infra" || 
        user.role === "func_infra" || 
        user.role === "lider_sistemas" || 
        user.role === "func_sistemas"
      )
    )
  }, [users])

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      {/* Linha principal com busca e botão de filtros */}
      <div className="flex items-center gap-4 mb-4">
        {/* Campo de busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets por número, título ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botão de filtros */}
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Botão limpar filtros */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Painel de filtros expandido */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-border">
          {/* Filtro por Equipe */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </label>
            <Select value={teamFilter} onValueChange={onTeamFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Urgência */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Urgência
            </label>
            <Select value={urgencyFilter} onValueChange={onUrgencyFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Responsável */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Responsável
            </label>
            <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
                <SelectItem value="jackson">Jackson</SelectItem>
                <SelectItem value="gustavo">Gustavo</SelectItem>
                <SelectItem value="danilo">Danilo</SelectItem>
                <SelectItem value="antony">Antony</SelectItem>
                <SelectItem value="rafael">Rafael</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data
            </label>
            <Select value={dateFilter} onValueChange={onDateFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categoria
            </label>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Busca: "{searchTerm}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {teamFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Equipe: {teamOptions.find(t => t.value === teamFilter)?.label}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onTeamFilterChange("all")}
              />
            </Badge>
          )}
          {urgencyFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Urgência: {urgencyOptions.find(u => u.value === urgencyFilter)?.label}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onUrgencyFilterChange("all")}
              />
            </Badge>
          )}
          {assigneeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Responsável: {
                assigneeFilter === "unassigned" 
                  ? "Não atribuído"
                  : assigneeFilter === "jackson"
                  ? "Jackson"
                  : assigneeFilter === "gustavo"
                  ? "Gustavo"
                  : assigneeFilter === "danilo"
                  ? "Danilo"
                  : assigneeFilter === "antony"
                  ? "Antony"
                  : assigneeFilter === "rafael"
                  ? "Rafael"
                  : assigneeFilter
              }
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onAssigneeFilterChange("all")}
              />
            </Badge>
          )}
          {dateFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Data: {dateOptions.find(d => d.value === dateFilter)?.label}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onDateFilterChange("all")}
              />
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Categoria: {categoryOptions.find(c => c.value === categoryFilter)?.label}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => onCategoryFilterChange("all")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}