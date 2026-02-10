"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Users,
  Building,
  Tag,
  Calendar,
  Target,
  Star
} from "lucide-react"

interface MetricsData {
  summary: {
    resolvedToday: number
    resolvedThisWeek: number
    createdToday: number
    createdThisWeek: number
    avgResolutionTime: number
  }
  ticketsByStatus: Array<{ status: string; count: number }>
  ticketsByTeam: Array<{ team: string; count: number }>
  ticketsByCategory: Array<{ category: string; count: number }>
  ticketsByUrgency: Array<{ urgency: string; count: number }>
  ticketsBySector: Array<{ sector: string; count: number }>
  performanceByAssignee: Array<{ assigneeId: string; assigneeName: string; ticketCount: number }>
  trendLast7Days: Array<{ date: string; created: number; resolved: number }>
  tiRatings: Array<{
    tiId: string
    tiName: string
    team: string
    avgRating: number
    totalRatings: number
    totalTickets: number
    ratings: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }>
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-700 border-green-300'
      case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Em Revisão': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Aberto': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'infra': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'sistemas': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.summary.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">tickets concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos na Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.summary.resolvedThisWeek}</div>
            <p className="text-xs text-muted-foreground">últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criados Hoje</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.summary.createdToday}</div>
            <p className="text-xs text-muted-foreground">novos tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criados na Semana</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.summary.createdThisWeek}</div>
            <p className="text-xs text-muted-foreground">últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{metrics.summary.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">resolução</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avaliações dos TIs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Avaliações dos Atendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.tiRatings.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhuma avaliação registrada ainda
                </div>
              ) : (
                metrics.tiRatings.map((ti, index) => (
                  <div key={ti.tiId} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {index < 3 && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {index + 1}
                            </div>
                          )}
                          <h4 className="font-semibold text-sm">{ti.tiName}</h4>
                        </div>
                        <Badge variant="outline" className={getTeamColor(ti.team)} size="sm">
                          {ti.team === 'infra' ? 'Infraestrutura' : 'Sistemas'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold text-yellow-600">{ti.avgRating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{ti.totalRatings} avaliações</p>
                      </div>
                    </div>
                    
                    {/* Distribuição de estrelas */}
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ti.ratings[stars as keyof typeof ti.ratings]
                        const percentage = ti.totalRatings > 0 ? (count / ti.totalRatings) * 100 : 0
                        return (
                          <div key={stars} className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-muted-foreground">{stars}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground w-8 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      {ti.totalTickets} chamados atendidos
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance da Equipe (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.performanceByAssignee
                .sort((a, b) => b.ticketCount - a.ticketCount)
                .slice(0, 5)
                .map((perf, index) => (
                <div key={perf.assigneeId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{perf.assigneeName}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {perf.ticketCount} tickets
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tickets por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.ticketsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="font-medium">{item.status}</span>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Equipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tickets por Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.ticketsByTeam.map((item) => (
                <div key={item.team} className="flex items-center justify-between">
                  <span className="font-medium capitalize">{item.team}</span>
                  <Badge variant="outline" className={getTeamColor(item.team)}>
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Urgência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tickets por Urgência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.ticketsByUrgency
                .sort((a, b) => {
                  const order = { critical: 4, high: 3, medium: 2, low: 1 }
                  return (order[b.urgency as keyof typeof order] || 0) - (order[a.urgency as keyof typeof order] || 0)
                })
                .map((item) => (
                <div key={item.urgency} className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {item.urgency === 'critical' ? 'Crítica' :
                     item.urgency === 'high' ? 'Alta' :
                     item.urgency === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Setor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Tickets por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {metrics.ticketsBySector
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                <div key={item.sector} className="flex items-center justify-between">
                  <span className="font-medium">{item.sector}</span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tickets por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.ticketsByCategory
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="font-medium">{item.category}</span>
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência dos Últimos 7 Dias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.trendLast7Days.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">
                  {new Date(day.date).toLocaleDateString('pt-BR', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Criados: {day.created}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Resolvidos: {day.resolved}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}