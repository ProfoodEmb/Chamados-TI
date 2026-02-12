import { useEffect, useRef, useState } from 'react'

interface SSEOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
}

export function useSSE(options: SSEOptions = {}) {
  const { onUpdate, enabled = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔌 [SSE] Iniciando conexão...')
    
    const connect = () => {
      try {
        console.log('🔌 [SSE] Criando EventSource para /api/tickets/events')
        const eventSource = new EventSource('/api/tickets/events')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('✅ [SSE] Conectado com sucesso!')
          setIsConnected(true)
          setLastUpdate(new Date())
          
          // Limpar timeout de reconexão se existir
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        eventSource.onmessage = (event) => {
          try {
            console.log('📨 [SSE] Mensagem recebida:', event.data)
            const data = JSON.parse(event.data)
            console.log('📨 [SSE] Dados parseados:', data)
            setLastUpdate(new Date())
            
            if (data.type !== 'connected') {
              console.log('🔔 [SSE] Chamando onUpdate com:', data)
              onUpdate?.(data)
            }
          } catch (error) {
            console.error('❌ [SSE] Erro ao processar mensagem:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('🚨 [SSE] Erro na conexão:', error)
          console.log('🚨 [SSE] ReadyState:', eventSource.readyState)
          setIsConnected(false)
          
          // Fechar conexão atual
          eventSource.close()
          
          // Tentar reconectar após 3 segundos
          if (!reconnectTimeoutRef.current) {
            console.log('🔄 [SSE] Agendando reconexão em 3s...')
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 [SSE] Tentando reconectar...')
              reconnectTimeoutRef.current = null
              connect()
            }, 3000)
          }
        }
      } catch (error) {
        console.error('❌ [SSE] Erro ao criar EventSource:', error)
        setIsConnected(false)
      }
    }

    connect()

    // Cleanup
    return cleanup
  }, [enabled, onUpdate])

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      console.log('🔌 Desconectando SSE...')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
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
    isConnected,
    lastUpdate: formatLastUpdate(),
  }
}
