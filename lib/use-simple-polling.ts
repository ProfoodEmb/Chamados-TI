import { useEffect, useRef, useState } from 'react'

interface PollingOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
  interval?: number // em milissegundos
}

export function useSimplePolling(options: PollingOptions = {}) {
  const { onUpdate, enabled = true, interval = 10000 } = options // 10 segundos por padrão
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTicketCountRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔄 Iniciando sistema de polling simples...')
    setIsActive(true)
    
    // Função para verificar atualizações
    const checkForUpdates = async () => {
      try {
        console.log('🔍 Verificando atualizações via polling...')
        
        // Buscar tickets para verificar se houve mudanças
        const response = await fetch('/api/tickets')
        if (response.ok) {
          const tickets = await response.json()
          const currentCount = tickets.length
          
          // Se o número de tickets mudou, notificar
          if (lastTicketCountRef.current > 0 && currentCount !== lastTicketCountRef.current) {
            console.log('📢 Mudança detectada via polling:', { 
              anterior: lastTicketCountRef.current, 
              atual: currentCount 
            })
            onUpdate?.({ 
              type: 'polling_update', 
              timestamp: new Date(),
              ticketCount: currentCount,
              previousCount: lastTicketCountRef.current
            })
          }
          
          lastTicketCountRef.current = currentCount
        }
        
        setLastUpdate(new Date())
      } catch (error) {
        console.error('❌ Erro no polling:', error)
      }
    }

    // Primeira verificação imediata
    checkForUpdates()

    // Configurar intervalo
    intervalRef.current = setInterval(checkForUpdates, interval)

    // Escutar eventos de foco da janela para atualizar imediatamente
    const handleFocus = () => {
      console.log('👁️ Janela focada - verificando atualizações')
      checkForUpdates()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível - verificando atualizações')
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
  }, [enabled, interval, onUpdate])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
  }

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada via polling')
    setLastUpdate(new Date())
    onUpdate?.({ type: 'force_update', timestamp: new Date() })
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