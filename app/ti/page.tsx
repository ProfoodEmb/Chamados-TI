"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, UserPlus, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { mockTickets } from "@/lib/mock-tickets"

export default function TIPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")

  const statusColors = {
    "Aberto": "bg-blue-500",
    "Pendente": "bg-yellow-500",
    "Fechado": "bg-gray-500",
    "Resolvido": "bg-green-500",
    "Aguardando Aprovação": "bg-orange-500",
  }

  const urgencyLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  }

  const urgencyColors = {
    low: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    critical: "text-red-600 bg-red-50 border-red-200",
  }

  // Estatísticas
  const totalTickets = mockTickets.length
  const pendingTickets = mockTickets.filter(t => t.status === "Pendente" || t.status === "Aberto").length
  const resolvedTickets = mockTickets.filter(t => t.status === "Resolvido").length
  const criticalTickets = mockTickets.filter(t => t.urgency === "critical").length

  // Filtrar tickets
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = searchTerm === "" || 
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || ticket.urgency === urgencyFilter
    
    return matchesSearch && matchesStatus && matchesUrgency
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 md:pl-16">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Dashboard T.I.</h1>
              <p className="text-muted-foreground">Gerencie todos os chamados do sistema</p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalTickets}</h3>
                <p className="text-sm text-muted-foreground">Total de Chamados</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{pendingTickets}</h3>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{resolvedTickets}</h3>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{criticalTickets}</h3>
                <p className="text-sm text-muted-foreground">Críticos</p>
              </div>
            </div>

            {/* Filtros e Ações */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número, assunto ou solicitante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro de Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                    <SelectItem value="Fechado">Fechado</SelectItem>
                    <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Urgência */}
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Urgências</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botões de Ação */}
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Tabela de Chamados */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Número</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Assunto</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Solicitante</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Responsável</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Urgência</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Última Ação</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm font-medium text-foreground">#{ticket.number}</span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">{ticket.category}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">{ticket.requester}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-foreground">{ticket.responsible}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`${urgencyColors[ticket.urgency]} border`}>
                            {urgencyLabels[ticket.urgency]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusColors[ticket.status]} text-white`}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{ticket.lastAction}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/tickets/${ticket.id}`}
                            >
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm">
                              Atribuir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTickets.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum chamado encontrado</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
