import { useEffect, useRef, useState } from 'react'

interface TicketPollingOptions {
  ticketId: string
  onUpdate?: (ticket: any) => void
  enabled?: boolean
  interval?: number // em milissegundos
}

export function useTicketPolling(options: TicketPollingOptions) {
  const { ticketId, onUpdate, enabled = true, interval = 5000 } = options // 5 segundos para chat
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCountRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !ticketId) {
      cleanup()
      return
    }

    console.log('💬 Iniciando polling de mensagens para ticket:', ticketId)
    setIsActive(true)
    
    // Função para verificar atualizações do ticket
    const checkForUpdates = async () => {
      try {
        console.log('🔍 Verificando mensagens do ticket via polling...')
        
        // Buscar ticket completo com mensagens
        const response = await fetch(`/api/tickets/${ticketId}`)
        if (response.ok) {
          const ticket = await response.json()
          const currentMessageCount = ticket.messages?.length || 0
          
          // Se o número de mensagens mudou, notificar
          if (lastMessageCountRef.current > 0 && currentMessageCount !== lastMessageCountRef.current) {
            console.log('💬 Nova mensagem detectada via polling:', { 
              anterior: lastMessageCountRef.current, 
              atual: currentMessageCount 
            })
            onUpdate?.(ticket)
          }
          
          // Se é a primeira vez, apenas definir o ticket
          if (lastMessageCountRef.current === 0) {
            onUpdate?.(ticket)
          }
          
          lastMessageCountRef.current = currentMessageCount
        }
        
        setLastUpdate(new Date())
      } catch (error) {
        console.error('❌ Erro no polling de mensagens:', error)
      }
    }

    // Primeira verificação imediata
    checkForUpdates()

    // Configurar intervalo
    intervalRef.current = setInterval(checkForUpdates, interval)

    // Escutar eventos de foco da janela para atualizar imediatamente
    const handleFocus = () => {
      console.log('👁️ Janela focada - verificando mensagens')
      checkForUpdates()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível - verificando mensagens')
        checkForUpdates()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cleanup()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, ticketId, interval, onUpdate])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
  }

  const forceUpdate = async () => {
    console.log('🔄 Atualização forçada de mensagens')
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (response.ok) {
        const ticket = await response.json()
        onUpdate?.(ticket)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('❌ Erro na atualização forçada:', error)
    }
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
    
    if (diff < 60) {
      return `${diff}s atrás`
    } else {
      const minutes = Math.floor(diff / 60)
      return `${minutes}min atrás`
    }
  }

  return {
    isActive,
    lastUpdate: formatLastUpdate(),
    forceUpdate,
    interval: Math.floor(interval / 1000) // retorna em segundos para display
  }
}