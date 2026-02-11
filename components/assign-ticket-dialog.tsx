"use client"

import { useState, useEffect } from "react"
import { UserCheck, Users, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  name: string
  username: string
  role: string
  team: string
}

interface Ticket {
  id: string
  number: string
  subject: string
  category: string
  urgency: string
  assignedTo?: User | null
}

interface AssignTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: Ticket | null
  currentUser: User
  onTicketAssigned?: () => void
}

export function AssignTicketDialog({ 
  open, 
  onOpenChange, 
  ticket, 
  currentUser,
  onTicketAssigned 
}: AssignTicketDialogProps) {
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [assignedUserName, setAssignedUserName] = useState("")

  // Carregar membros da equipe
  useEffect(() => {
    if (open && currentUser) {
      fetchTeamMembers()
    }
  }, [open, currentUser])

  const fetchTeamMembers = async () => {
    setIsLoadingMembers(true)
    try {
      console.log('🔍 [AssignDialog] Buscando membros da equipe:', currentUser.team)
      console.log('🔍 [AssignDialog] URL:', `/api/users?team=${currentUser.team}`)
      
      // Buscar usuários da mesma equipe
      const response = await fetch(`/api/users?team=${currentUser.team}`)
      const data = await response.json()

      console.log('📦 [AssignDialog] Resposta da API:', data)
      console.log('📦 [AssignDialog] Status:', response.status)

      if (response.ok) {
        // Incluir todos os membros da equipe, incluindo líderes
        const members = data.users.filter((user: User) => 
          user.team === currentUser.team
        )
        console.log('✅ [AssignDialog] Membros filtrados:', members)
        setTeamMembers(members)
      } else {
        console.error("❌ [AssignDialog] Erro ao carregar membros da equipe:", data.error)
      }
    } catch (error) {
      console.error("❌ [AssignDialog] Erro ao carregar membros da equipe:", error)
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleAssign = async () => {
    if (!ticket || !selectedUserId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assignedToId: selectedUserId 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const assignedUser = teamMembers.find(user => user.id === selectedUserId)
        setAssignedUserName(assignedUser?.name || "")
        setShowSuccess(true)
        
        // Fechar modal de sucesso após 3 segundos
        setTimeout(() => {
          setShowSuccess(false)
          onOpenChange(false)
          onTicketAssigned?.()
        }, 3000)
      } else {
        alert(`Erro ao atribuir ticket: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao atribuir ticket:", error)
      alert("Erro ao atribuir ticket. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedUserId("")
      setShowSuccess(false)
      setAssignedUserName("")
    }
    onOpenChange(open)
  }

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return colors[urgency as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getUrgencyLabel = (urgency: string) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta", 
      critical: "Crítica"
    }
    return labels[urgency as keyof typeof labels] || urgency
  }

  if (!ticket) return null

  // Modal de Sucesso
  if (showSuccess) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[450px] border-0 p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Ticket Atribuído com Sucesso
          </DialogTitle>
          
          {/* Animação de fundo */}
          <div className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-8 text-white overflow-hidden">
            {/* Efeitos visuais de fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            
            {/* Conteúdo */}
            <div className="relative text-center space-y-6">
              {/* Ícone animado */}
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-success-bounce">
                <CheckCircle2 className="w-12 h-12 text-white animate-success-pulse" />
              </div>
              
              {/* Título */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 animate-success-sparkle" />
                  Sucesso!
                  <Sparkles className="w-6 h-6 animate-success-sparkle" />
                </h2>
                <p className="text-white/90 text-lg">Ticket atribuído com sucesso</p>
              </div>
              
              {/* Informações */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                <p className="text-sm text-white/80">Ticket #{ticket.number}</p>
                <p className="font-semibold text-lg">{ticket.subject}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <p className="text-white/90">
                    Atribuído para <span className="font-bold">{assignedUserName}</span>
                  </p>
                </div>
              </div>
              
              {/* Indicador de fechamento automático */}
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                <span>Fechando automaticamente...</span>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border-0 p-0 gap-0">
        <DialogTitle className="sr-only">
          Atribuir Ticket
        </DialogTitle>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Atribuir Ticket</h2>
              <p className="text-white/90 text-sm">Delegar chamado para um funcionário</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Ticket */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Ticket #{ticket.number}</h3>
              <Badge className={getUrgencyColor(ticket.urgency)}>
                {getUrgencyLabel(ticket.urgency)}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-gray-900">{ticket.subject}</p>
              <p className="text-sm text-gray-600">{ticket.category}</p>
            </div>
            {ticket.assignedTo && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Atualmente atribuído para:</span> {ticket.assignedTo.name}
              </div>
            )}
          </div>

          {/* Seleção de Funcionário */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Atribuir para <span className="text-red-500">*</span>
            </label>
            
            {isLoadingMembers ? (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Carregando funcionários...</span>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum funcionário disponível na sua equipe</p>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Selecione um funcionário..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">@{member.username}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-gray-50 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedUserId || isLoading || teamMembers.length === 0}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Atribuindo...
              </div>
            ) : (
              "Atribuir Ticket"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}