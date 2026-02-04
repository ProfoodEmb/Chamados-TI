"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, User, Calendar, Tag, AlertCircle } from "lucide-react"

interface Ticket {
  id: string
  number: string
  subject: string
  description?: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  createdAt: string
  team: string | null
  requester: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
}

interface KanbanTicketModalProps {
  ticket: Ticket
  onClose: () => void
  onUpdate?: (ticketId: string, updates: any) => void
}

const urgencyLabels = {
  low: "Baixa",
  medium: "Média", 
  high: "Alta",
  critical: "Crítica",
}

const urgencyColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600", 
  critical: "text-red-600",
}

const statusOptions = [
  "Aberto",
  "Em Andamento", 
  "Pendente",
  "Em Revisão",
  "Resolvido",
  "Fechado"
]

export function KanbanTicketModal({ ticket, onClose, onUpdate }: KanbanTicketModalProps) {
  const [description, setDescription] = useState(ticket.description || "")
  const [status, setStatus] = useState(ticket.status)
  const [urgency, setUrgency] = useState(ticket.urgency)
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo?.id || "")
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    fields: true,
    info: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(ticket.id, {
        description,
        status,
        urgency,
        assignedToId: assignedTo || null
      })
    }
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTeamMembers = () => {
    if (ticket.team === 'infra') {
      return [
        { id: 'lider_infra', name: 'Jackson Felipe (Líder)' },
        { id: 'func_infra', name: 'Gustavo Americano' },
      ]
    } else if (ticket.team === 'sistemas') {
      return [
        { id: 'lider_sistemas', name: 'Antony Gouvea (Líder)' },
        { id: 'func_sistemas', name: 'Danilo Oliveira' },
      ]
    }
    return []
  }

  return (
    <div className="flex h-full">
      {/* Lado esquerdo - Conteúdo principal */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-sm text-muted-foreground">#{ticket.number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${urgencyColors[ticket.urgency]}`}>
              {urgencyLabels[ticket.urgency]}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-2">{ticket.subject}</h1>
        </div>

        {/* Seção Descrição */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('description')}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            {expandedSections.description ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Descrição
          </button>
          
          {expandedSections.description && (
            <div className="pl-6">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição..."
                className="min-h-30 resize-none"
              />
            </div>
          )}
        </div>

        <div className="border-t border-border my-4" />

        {/* Seção Subtarefas */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('fields')}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            {expandedSections.fields ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Campos personalizados
          </button>
          
          {expandedSections.fields && (
            <div className="pl-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Prioridade</Label>
                  <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave}>Salvar</Button>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>

      {/* Lado direito - Informações */}
      <div className="w-80 border-l border-border p-6 bg-muted/20">
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary">{status}</Badge>
          </div>

          <div className="border-t border-border my-4" />

          {/* Seção Informações */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('info')}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary w-full justify-start"
            >
              {expandedSections.info ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Informações
            </button>

            {expandedSections.info && (
              <div className="space-y-4 pl-6">
                {/* Responsável */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Responsável</span>
                  </div>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Não atribuído" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não atribuído</SelectItem>
                      {getTeamMembers().map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridade */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Prioridade</span>
                  </div>
                  <div className={`text-sm font-medium ${urgencyColors[urgency]}`}>
                    {urgencyLabels[urgency]}
                  </div>
                </div>

                {/* Data de criação */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Data de criação</span>
                  </div>
                  <div className="text-sm">{formatDate(ticket.createdAt)}</div>
                </div>

                {/* Setor */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Setor</span>
                  </div>
                  <Badge variant="outline">
                    {ticket.team === "infra" ? "Infraestrutura" : ticket.team === "sistemas" ? "Sistemas" : "Geral"}
                  </Badge>
                </div>

                {/* Solicitante */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Solicitante</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {ticket.requester.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{ticket.requester.name}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}