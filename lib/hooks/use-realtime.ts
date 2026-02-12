import { useEffect, useState } from 'react'
import { useSSE } from './use-sse'

interface RealtimeOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
  fallbackInterval?: number
}

export function useRealtime(options: RealtimeOptions = {}) {
  const { onUpdate, enabled = true, fallbackInterval = 30000 } = options
  const [mode, setMode] = useState<'sse' | 'polling' | 'disabled'>('sse')
  const [pollingActive, setPollingActive] = useState(false)
  
  // Usar SSE (Server-Sent Events)
  const sse = useSSE({
    onUpdate: onUpdate,
    enabled: enabled && mode === 'sse'
  })
  
  // Sistema de polling como fallback
  useEffect(() => {
    if (!enabled || mode !== 'polling') {
      return
    }

    console.log('🔄 Iniciando polling como fallback...')
    setPollingActive(true)
    
    const interval = setInterval(() => {
      console.log('🔍 Polling - verificando atualizações...')
      onUpdate?.({ type: 'polling_update', timestamp: new Date() })
    }, fallbackInterval)

    // Atualizar quando a janela ganhar foco
    const handleFocus = () => {
      console.log('👁️ Janela focada - atualizando via polling')
      onUpdate?.({ type: 'focus_update', timestamp: new Date() })
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      setPollingActive(false)
    }
  }, [enabled, mode, fallbackInterval, onUpdate])

  // Monitorar conexão SSE e fazer fallback se necessário
  useEffect(() => {
    if (!enabled) {
      setMode('disabled')
      return
    }

    // Se SSE não conectar em 10 segundos, usar polling
    const fallbackTimer = setTimeout(() => {
      if (!sse.isConnected && mode === 'sse') {
        console.log('⚠️ SSE não conectou em 10s - usando polling como fallback')
        setMode('polling')
      }
    }, 10000)

    // Se SSE conectar, cancelar fallback
    if (sse.isConnected && mode === 'sse') {
      clearTimeout(fallbackTimer)
    }

    return () => clearTimeout(fallbackTimer)
  }, [sse.isConnected, enabled, mode])

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada')
    onUpdate?.({ type: 'force_update', timestamp: new Date() })
  }

  const getLastUpdate = () => {
    if (mode === 'sse') {
      return sse.lastUpdate
    } else if (mode === 'polling') {
      const now = new Date()
      const seconds = Math.floor(now.getSeconds() / 30) * 30
      const diff = now.getSeconds() - seconds
      return `${30 - diff}s`
    }
    return 'desconectado'
  }

  return {
    isConnected: mode === 'sse' ? sse.isConnected : pollingActive,
    lastUpdate: getLastUpdate(),
    mode,
    forceUpdate,
    connectionError: null
  }
}