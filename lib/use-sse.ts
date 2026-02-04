import { useEffect, useRef, useState } from 'react'

interface SSEOptions {
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  enabled?: boolean
}

export function useSSE(url: string, options: SSEOptions = {}) {
  const { onMessage, onError, onOpen, enabled = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false)
      return
    }

    const connectSSE = () => {
      try {
        // Limpar timeout anterior
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }

        // Fechar conexão existente se houver
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        console.log('Tentando conectar SSE...')
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('SSE conectado com sucesso')
          setIsConnected(true)
          reconnectAttemptsRef.current = 0 // Reset contador
          onOpen?.()
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            onMessage?.(data)
          } catch (error) {
            console.error('Erro ao parsear mensagem SSE:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.log('SSE connection error')
          setIsConnected(false)
          onError?.(error)
          
          // Fechar conexão atual
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
          }
          
          // Tentar reconectar apenas se não excedeu o limite
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Backoff exponencial
            
            console.log(`Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts} em ${delay}ms`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (enabled && !eventSourceRef.current) {
                connectSSE()
              }
            }, delay)
          } else {
            console.log('Máximo de tentativas de reconexão atingido')
          }
        }
      } catch (error) {
        console.error('Erro ao conectar SSE:', error)
        setIsConnected(false)
      }
    }

    connectSSE()

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      
      setIsConnected(false)
      reconnectAttemptsRef.current = 0
    }
  }, [url, enabled, onMessage, onError, onOpen])

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsConnected(false)
    reconnectAttemptsRef.current = maxReconnectAttempts // Impedir novas tentativas
  }

  const reconnect = () => {
    reconnectAttemptsRef.current = 0
    disconnect()
    // O useEffect vai reconectar automaticamente
  }

  return { isConnected, disconnect, reconnect }
}