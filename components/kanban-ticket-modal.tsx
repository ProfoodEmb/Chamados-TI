"use client"

import { useState, memo, useEffect } from "react"
import { X, User, Calendar, Send, Paperclip } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: string
  name: string
  email: string
}

interface Message {
  id: string
  content: string
  role: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

interface Ticket {
  id: string
  number: string
  subject: string
  description?: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  kanbanStatus: string
  team: string | null
  createdAt: string
  updatedAt: string
  service?: string | null
  requester: User
  assignedTo?: User | null
  messages?: Message[]
}

interface KanbanTicketModalProps {
  ticket: Ticket
  onClose: () => void
  onUpdate: (ticketId: string, updates: any) => void
}

// Componente memoizado para melhor performance
export const KanbanTicketModal = memo(function KanbanTicketModal({ ticket, onClose, onUpdate }: KanbanTicketModalProps) {
  const [newComment, setNewComment] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const urgencyColors = {
    low: "bg-green-100 text-green-700 border-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    critical: "bg-red-100 text-red-700 border-red-300",
  }

  const urgencyLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  }

  // Memoizar valores computados
  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
  
  const urgencyClass = urgencyColors[ticket.urgency]
  const urgencyLabel = urgencyLabels[ticket.urgency]
  const userInitials = ticket.assignedTo?.name.split(" ").map(n => n[0]).join("").slice(0, 2)

  // Buscar detalhes do ticket incluindo mensagens
  useEffect(() => {
    const fetchTicketDetails = async () => {
      setIsLoadingMessages(true)
      try {
        const response = await fetch(`/api/tickets/${ticket.id}`)
        if (response.ok) {
          const ticketData = await response.json()
          setMessages(ticketData.messages || [])
        } else {
          console.error('Erro ao buscar mensagens do ticket')
        }
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchTicketDetails()
  }, [ticket.id])

  const handleAddComment = async () => {
    if (!newComment.trim() || isSendingMessage) return

    setIsSendingMessage(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
        setNewComment("")
        console.log('✅ Comentário adicionado com sucesso')
      } else {
        const error = await response.json()
        console.error('❌ Erro ao adicionar comentário:', error.error)
        alert('Erro ao adicionar comentário: ' + error.error)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar comentário:', error)
      alert('Erro ao enviar comentário')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">#{ticket.number}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${urgencyClass}`}>
              {urgencyLabel}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Título */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">{ticket.subject}</h1>
          <p className="text-sm text-gray-600 mt-1">{ticket.description || "Equipamento de rede danificado necessita substituição"}</p>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8">
              
              {/* Coluna Esquerda - Informações */}
              <div className="space-y-6">
                
                {/* Solicitante */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Solicitante</span>
                  </div>
                  <p className="font-medium text-gray-900">{ticket.requester.name}</p>
                </div>

                {/* Data */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Data</span>
                  </div>
                  <p className="font-medium text-gray-900">{formattedDate}</p>
                </div>

                {/* Prioridade */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">Prioridade</span>
                  </div>
                  <Badge className={`${urgencyClass} font-medium`}>
                    {urgencyLabel}
                  </Badge>
                </div>

                {/* Patrimônio */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">Patrimônio</span>
                  </div>
                  <p className="font-medium text-gray-900">{ticket.service || "TUI00054"}</p>
                </div>

              </div>

              {/* Coluna Direita - Responsável */}
              <div>
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Responsável</span>
                </div>
                
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{ticket.assignedTo.name}</p>
                      <p className="text-sm text-gray-500">Atribuído</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Não atribuído</p>
                        <p className="text-sm text-gray-500">Nenhum responsável definido</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className="border-t bg-gray-50">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Comentários</span>
              {messages.length > 0 && (
                <span className="text-xs text-gray-400">({messages.length})</span>
              )}
            </div>
            
            {/* Lista de Comentários */}
            <div className="max-h-60 overflow-y-auto mb-4">
              {isLoadingMessages ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Carregando comentários...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Nenhum comentário ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {message.author.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg p-3 shadow-sm border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {message.author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatMessageDate(message.createdAt)}
                            </span>
                            {message.role === 'support' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Suporte
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input para novo comentário */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Adicionar comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20 resize-none"
                  disabled={isSendingMessage}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSendingMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSendingMessage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" disabled={isSendingMessage}>
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
})