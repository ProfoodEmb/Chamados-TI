"use client"

import { useState, useEffect, useCallback } from 'react'

interface Ticket {
  id: string
  number: string
  subject: string
  description?: string
  category: string
  urgency: "low" | "medium" | "high" | "critical"
  status: string
  kanbanStatus: string
  createdAt: string
  updatedAt: string
  team: string | null
  service?: string | null
  anydesk?: string | null
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
  assignedToId: string | null
}

interface UseKanbanRealtimeOptions {
  enabled?: boolean
  interval?: number
  onTicketUpdate?: (ticket: Ticket) => void
  onTicketCreate?: (ticket: Ticket) => void
  onTicketMove?: (ticketId: string, fromColumn: string, toColumn: string) => void
}

export function useKanbanRealtime({
  enabled = true,
  interval = 5000, // 5 segundos
  onTicketUpdate,
  onTicketCreate,
  onTicketMove
}: UseKanbanRealtimeOptions = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0)

  // Função para buscar tickets
  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const newTickets = await response.json()
        
        // Detectar mudanças
        if (tickets.length > 0) {
          detectChanges(tickets, newTickets)
        }
        
        setTickets(newTickets)
        setIsConnected(true)
        setError(null)
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      console.error('❌ Erro ao buscar tickets:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [tickets, onTicketUpdate, onTicketCreate, onTicketMove])

  // Detectar mudanças entre estados antigo e novo
  const detectChanges = useCallback((oldTickets: Ticket[], newTickets: Ticket[]) => {
    const oldTicketsMap = new Map(oldTickets.map(t => [t.id, t]))

    // Detectar apenas tickets novos (não movimentações)
    newTickets.forEach(newTicket => {
      if (!oldTicketsMap.has(newTicket.id)) {
        console.log('🆕 Novo ticket detectado:', newTicket.number)
        onTicketCreate?.(newTicket)
        showNotification(`Novo ticket: #${newTicket.number}`, 'success')
      }
    })

    // Log das movimentações apenas no console (sem notificação visual)
    newTickets.forEach(newTicket => {
      const oldTicket = oldTicketsMap.get(newTicket.id)
      if (oldTicket && oldTicket.kanbanStatus !== newTicket.kanbanStatus) {
        console.log(`📦 Ticket ${newTicket.number} movido: ${oldTicket.kanbanStatus} → ${newTicket.kanbanStatus}`)
        onTicketMove?.(newTicket.id, oldTicket.kanbanStatus, newTicket.kanbanStatus)
        // Removido: showNotification para movimentações
      }
    })
  }, [onTicketUpdate, onTicketCreate, onTicketMove])

  // Função para mostrar notificações com debounce
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const now = Date.now()
    
    // Evitar notificações muito frequentes (menos de 2 segundos)
    if (now - lastNotificationTime < 2000) {
      return
    }
    
    setLastNotificationTime(now)
    
    // Usar o sistema de toast simples se disponível
    if ((window as any).showSimpleToast && (type === 'success' || type === 'info')) {
      (window as any).showSimpleToast(message, type)
    } else {
      // Fallback para console
      console.log(`📢 ${type.toUpperCase()}: ${message}`)
    }
  }

  // Função auxiliar para nomes das colunas
  const getColumnName = (kanbanStatus: string) => {
    const names = {
      inbox: 'Caixa de Entrada',
      in_progress: 'Em Andamento',
      review: 'Em Revisão',
      done: 'Concluído'
    }
    return names[kanbanStatus as keyof typeof names] || kanbanStatus
  }

  // Função para forçar atualização
  const forceUpdate = useCallback(() => {
    console.log('🔄 Forçando atualização do Kanban...')
    fetchTickets()
  }, [fetchTickets])

  // Função para atualizar ticket localmente (optimistic update)
  const updateTicketLocally = useCallback((ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      )
    )
  }, [])

  // Polling em tempo real
  useEffect(() => {
    if (!enabled) return

    // Buscar imediatamente
    fetchTickets()

    // Configurar polling
    const intervalId = setInterval(fetchTickets, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, interval, fetchTickets])

  // Escutar eventos globais
  useEffect(() => {
    const handleTicketCreated = () => {
      console.log('🎉 Evento ticketCreated recebido - atualizando Kanban')
      forceUpdate()
    }

    const handleTicketUpdated = () => {
      console.log('🔄 Evento ticketUpdated recebido - atualizando Kanban')
      forceUpdate()
    }

    window.addEventListener('ticketCreated', handleTicketCreated)
    window.addEventListener('ticketUpdated', handleTicketUpdated)

    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
      window.removeEventListener('ticketUpdated', handleTicketUpdated)
    }
  }, [forceUpdate])

  // Escutar mudanças de foco da janela
  useEffect(() => {
    const handleFocus = () => {
      if (enabled) {
        console.log('👁️ Janela focada - atualizando Kanban')
        forceUpdate()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [enabled, forceUpdate])

  return {
    tickets,
    isLoading,
    isConnected,
    lastUpdate,
    error,
    forceUpdate,
    updateTicketLocally
  }
}