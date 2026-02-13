"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Paperclip, Download, X, Image, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TicketFeedbackDialog } from "@/components/features/tickets/ticket-feedback-dialog"

interface Attachment {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string
  }
}
interface Message {
  id: string
  content: string
  role: "user" | "support"
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
  description: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  createdAt: string
  rating?: number | null
  feedback?: string | null
  requester: {
    id: string
    name: string
  }
  assignedTo?: {
    id: string
    name: string
  } | null
  service?: string
  anydesk?: string
  messages: Message[]
  attachments?: Attachment[]
}

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

interface TicketDetailProps {
  ticket: Ticket
  onMessageSent?: () => void
  currentUser?: {
    id: string
    team: string
  }
}

export function TicketDetail({ ticket, onMessageSent, currentUser }: TicketDetailProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasShownFeedbackDialog = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [ticket.messages, ticket.attachments])

  // Mostrar diálogo quando status mudar para "Aguardando Aprovação"
  useEffect(() => {
    console.log('🔍 Status check:', {
      status: ticket.status,
      currentUserId: currentUser?.id,
      requesterId: ticket.requester.id,
      hasShown: hasShownFeedbackDialog.current,
      shouldShow: ticket.status === "Aguardando Aprovação" && currentUser?.id === ticket.requester.id,
      isRequester: currentUser?.id === ticket.requester.id
    })
    
    if (
      ticket.status === "Aguardando Aprovação" && 
      currentUser?.id === ticket.requester.id &&
      !hasShownFeedbackDialog.current
    ) {
      console.log('✅ Mostrando diálogo de feedback')
      setShowFeedbackDialog(true)
      hasShownFeedbackDialog.current = true
    } else {
      console.log('❌ Não mostrando diálogo:', {
        statusCorreto: ticket.status === "Aguardando Aprovação",
        isRequester: currentUser?.id === ticket.requester.id,
        naoMostrado: !hasShownFeedbackDialog.current
      })
    }
    
    // Reset quando o status mudar para algo diferente
    if (ticket.status !== "Aguardando Aprovação" && ticket.status !== "Resolvido") {
      hasShownFeedbackDialog.current = false
    }
  }, [ticket.status, currentUser?.id, ticket.requester.id])

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/tickets/${ticket.id}/attachments`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const attachment = await response.json()
        // Não precisa mais atualizar estado local, o polling vai buscar
        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao fazer upload do arquivo")
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload do arquivo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImageFile = (mimeType: string) => {
    return mimeType.startsWith('image/')
  }

  const getFileIcon = (mimeType: string) => {
    if (isImageFile(mimeType)) {
      return <Image className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage("")
        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao enviar mensagem")
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      alert("Erro ao enviar mensagem")
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRequestClose = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/request-close`, {
        method: "POST",
      })

      if (response.ok) {
        // Disparar evento para atualizar outras telas
        window.dispatchEvent(new CustomEvent('ticketUpdated', { 
          detail: { ticketId: ticket.id, action: 'request-close' } 
        }))
        
        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao solicitar finalização")
      }
    } catch (error) {
      console.error("Erro ao solicitar finalização:", error)
      alert("Erro ao solicitar finalização")
    }
  }

  const handleRespondClose = async (accept: boolean) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/respond-close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accept }),
      })

      if (response.ok) {
        // Disparar evento para atualizar outras telas
        window.dispatchEvent(new CustomEvent('ticketUpdated', { 
          detail: { ticketId: ticket.id, action: 'respond-close', accept } 
        }))
        
        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao responder")
      }
    } catch (error) {
      console.error("Erro ao responder:", error)
      alert("Erro ao responder")
    }
  }

  const handleSubmitRating = async (rating: number, feedback: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, feedback }),
      })

      if (response.ok) {
        if (onMessageSent) {
          onMessageSent()
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Erro ao avaliar")
      }
    } catch (error) {
      console.error("Erro ao avaliar:", error)
      throw error
    }
  }

  const handleReopenTicket = async () => {
    await handleRespondClose(false)
  }

  const handleConfirmResolved = async () => {
    await handleRespondClose(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar com informações do chamado */}
      <div className="w-72 border-r border-border bg-card shrink-0">
        <div className="p-4">
          <Link href="/tickets" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos chamados
          </Link>
          
          <h2 className="text-lg font-semibold mb-4">Chamado {ticket.number}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Solicitante</label>
              <p className="text-sm font-medium">{ticket.requester.name}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</label>
              <p className="text-sm font-medium">{ticket.assignedTo?.name || "Não atribuído"}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
              <div className="mt-1">
                <Badge className={`${statusColors[ticket.status as keyof typeof statusColors]} text-white`}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Serviço</label>
              <p className="text-sm">{ticket.service || ticket.category}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</label>
              <p className="text-sm">{ticket.category}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Urgência</label>
              <p className="text-sm">{urgencyLabels[ticket.urgency]}</p>
            </div>
            
            {ticket.anydesk && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">AnyDesk</label>
                <p className="text-sm font-mono">{ticket.anydesk}</p>
              </div>
            )}
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Criado em</label>
              <p className="text-sm">{formatDate(ticket.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área principal com chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header do chamado */}
        <div className="p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{ticket.subject}</h1>
              <p className="text-sm text-muted-foreground">
                Chamado aberto por <span className="font-medium">{ticket.requester.name}</span> em {formatDate(ticket.createdAt)}
              </p>
            </div>
            
            {/* Botão de finalizar para TI */}
            {currentUser && 
             (currentUser.team === "infra" || currentUser.team === "sistemas" || currentUser.team === "admin") &&
             ticket.status === "Aberto" && (
              <Button
                onClick={handleRequestClose}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 shrink-0"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Chamado
              </Button>
            )}
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 pb-8 bg-muted/20 space-y-4">
          {ticket.messages.length === 0 && (!ticket.attachments || ticket.attachments.length === 0) ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Envie uma mensagem para iniciar a conversa.</p>
            </div>
          ) : (
            <>
              {/* Mesclar mensagens e anexos por data */}
              {[
                ...ticket.messages.map(msg => ({ type: 'message' as const, data: msg, createdAt: msg.createdAt })),
                ...(ticket.attachments || []).map(att => ({ type: 'attachment' as const, data: att, createdAt: att.createdAt }))
              ]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((item, index) => {
                  if (item.type === 'message') {
                    const message = item.data
                    return (
                      <div key={`msg-${message.id}`} className="flex gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className={message.role === "support" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                            {getInitials(message.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.author.name}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.role === "support" 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-card border border-border"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  } else {
                    const attachment = item.data
                    return (
                      <div key={`att-${attachment.id}`} className="flex gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-muted">
                            {getInitials(attachment.uploadedBy.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{attachment.uploadedBy.name}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(attachment.createdAt)}</span>
                          </div>
                          <div className="bg-card border border-border rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <div className="shrink-0">
                                {getFileIcon(attachment.mimeType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" title={attachment.filename}>
                                  {attachment.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="shrink-0"
                                title="Baixar arquivo"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        {ticket.status !== "Fechado" && ticket.status !== "Resolvido" && (
          <div className="p-4 border-t border-border bg-card flex-shrink-0">
            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
            />
            
            {/* Indicador de upload */}
            {isUploading && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-blue-600">Enviando arquivo...</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-16 pr-10 resize-none"
                  disabled={isSending || isUploading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  disabled={isSending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Anexar arquivo"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || isUploading}
                className="self-end"
              >
                {isSending ? "Enviando..." : <Send className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Dica sobre tipos de arquivo */}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Tipos permitidos: Imagens, PDF, Word, Excel, TXT (máx. 10MB)
            </p>
          </div>
        )}

        {/* Chamado fechado */}
        {(ticket.status === "Fechado" || ticket.status === "Resolvido") && (
          <div className="p-4 border-t border-border bg-muted/50 text-center flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              Este chamado foi {ticket.status.toLowerCase()}. Não é possível enviar novas mensagens.
            </p>
          </div>
        )}
      </div>

      {/* Diálogo de feedback/avaliação */}
      {showFeedbackDialog && (
        <TicketFeedbackDialog
          ticketNumber={ticket.number}
          onClose={() => setShowFeedbackDialog(false)}
          onSubmit={handleSubmitRating}
          onReopen={handleReopenTicket}
          onConfirmResolved={handleConfirmResolved}
        />
      )}
    </div>
  )
}
