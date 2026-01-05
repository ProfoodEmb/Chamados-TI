"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Paperclip, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Ticket, type Message } from "@/lib/mock-tickets"

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
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const [messages, setMessages] = useState<Message[]>(ticket.messages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `m${messages.length + 1}`,
      author: "Você",
      role: "user",
      content: newMessage,
      timestamp: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
    <div className="flex h-full">
      {/* Sidebar com informações do chamado */}
      <div className="w-72 border-r border-border bg-card flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          <Link href="/tickets" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos chamados
          </Link>
          
          <h2 className="text-lg font-semibold mb-4">Chamado {ticket.number}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Solicitante</label>
              <p className="text-sm font-medium">{ticket.requester}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</label>
              <p className="text-sm font-medium">{ticket.responsible}</p>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
              <div className="mt-1">
                <Badge className={`${statusColors[ticket.status]} text-white`}>
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
              <p className="text-sm">{ticket.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Área principal com chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header do chamado */}
        <div className="p-4 border-b border-border bg-card">
          <h1 className="text-lg font-semibold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Chamado aberto por <span className="font-medium">{ticket.requester}</span> em {ticket.createdAt}
          </p>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Envie uma mensagem para iniciar a conversa.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "" : ""}`}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className={message.role === "support" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {getInitials(message.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.author}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        {ticket.status !== "Fechado" && ticket.status !== "Resolvido" && (
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[80px] pr-10 resize-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Chamado fechado */}
        {(ticket.status === "Fechado" || ticket.status === "Resolvido") && (
          <div className="p-4 border-t border-border bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              Este chamado foi {ticket.status.toLowerCase()}. Não é possível enviar novas mensagens.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
