import { useEffect, useRef, useState, useCallback } from 'react'

interface PollingOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
  interval?: number // em milissegundos
}

export function useSimplePolling(options: PollingOptions = {}) {
  const { onUpdate, enabled = true, interval = 15000 } = options // 15 segundos por padrão
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTicketHashRef = useRef<string>('')
  const isCheckingRef = useRef<boolean>(false) // Prevenir múltiplas chamadas simultâneas

  // Memoizar a função de callback para evitar re-criações
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔄 Iniciando sistema de polling otimizado...')
    setIsActive(true)
    
    // Função otimizada para verificar atualizações
    const checkForUpdates = async () => {
      // Evitar múltiplas chamadas simultâneas
      if (isCheckingRef.current) {
        console.log('⏳ Polling já em andamento, pulando...')
        return
      }

      isCheckingRef.current = true

      try {
        console.log('🔍 Verificando atualizações via polling...')
        
        // Usar AbortController para cancelar requisições se necessário
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

        const response = await fetch('/api/tickets', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const tickets = await response.json()
          
          // Criar hash otimizado dos tickets para detectar mudanças
          const ticketHash = tickets
            .map((t: any) => `${t.id}-${t.kanbanStatus}-${t.updatedAt}`)
            .sort() // Ordenar para consistência
            .join('|')
          
          // Se houve mudanças nos tickets, notificar
          if (lastTicketHashRef.current && ticketHash !== lastTicketHashRef.current) {
            console.log('📢 Mudanças detectadas via polling')
            memoizedOnUpdate({ 
              type: 'polling_update', 
              timestamp: new Date(),
              ticketCount: tickets.length,
              hasChanges: true
            })
          } else if (lastTicketHashRef.current) {
            // Polling normal sem mudanças - não fazer nada para economizar recursos
            console.log('✅ Polling - sem mudanças')
          }
          
          lastTicketHashRef.current = ticketHash
        }
        
        setLastUpdate(new Date())
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('❌ Erro no polling:', error)
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    // Primeira verificação com delay para não sobrecarregar
    setTimeout(checkForUpdates, 1000)

    // Configurar intervalo
    intervalRef.current = setInterval(checkForUpdates, interval)

    // Escutar eventos de foco da janela para atualizar imediatamente
    const handleFocus = () => {
      console.log('👁️ Janela focada - verificando atualizações')
      setTimeout(checkForUpdates, 500) // Pequeno delay
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível - verificando atualizações')
        setTimeout(checkForUpdates, 500)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cleanup()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, interval, memoizedOnUpdate])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isCheckingRef.current = false
    setIsActive(false)
  }

  const forceUpdate = useCallback(() => {
    console.log('🔄 Atualização forçada via polling')
    setLastUpdate(new Date())
    memoizedOnUpdate({ type: 'force_update', timestamp: new Date() })
  }, [memoizedOnUpdate])

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