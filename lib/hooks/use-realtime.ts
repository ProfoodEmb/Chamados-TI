import { useEffect, useState } from 'react'
import { useSocket } from './use-socket'

interface RealtimeOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
  fallbackInterval?: number
}

export function useRealtime(options: RealtimeOptions = {}) {
  const { onUpdate, enabled = true, fallbackInterval = 30000 } = options
  const [mode, setMode] = useState<'socket' | 'polling' | 'disabled'>('socket')
  const [pollingActive, setPollingActive] = useState(false)
  
  // Tentar Socket.IO primeiro
  const socket = useSocket({
    onTicketUpdate: onUpdate,
    enabled: enabled && mode === 'socket'
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

  // Monitorar conexão Socket.IO e fazer fallback se necessário
  useEffect(() => {
    if (!enabled) {
      setMode('disabled')
      return
    }

    // Se Socket.IO não conectar em 15 segundos, usar polling
    const fallbackTimer = setTimeout(() => {
      if (!socket.isConnected && mode === 'socket') {
        console.log('⚠️ Socket.IO não conectou em 15s - usando polling como fallback')
        setMode('polling')
      }
    }, 15000)

    // Se Socket.IO conectar, cancelar fallback
    if (socket.isConnected && mode === 'socket') {
      clearTimeout(fallbackTimer)
    }

    return () => clearTimeout(fallbackTimer)
  }, [socket.isConnected, enabled, mode])

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada')
    onUpdate?.({ type: 'force_update', timestamp: new Date() })
  }

  const getLastUpdate = () => {
    if (mode === 'socket') {
      return socket.lastUpdate
    } else if (mode === 'polling') {
      const now = new Date()
      const seconds = Math.floor(now.getSeconds() / 30) * 30
      const diff = now.getSeconds() - seconds
      return `${30 - diff}s`
    }
    return 'desconectado'
  }

  return {
    isConnected: mode === 'socket' ? socket.isConnected : pollingActive,
    lastUpdate: getLastUpdate(),
    mode,
    forceUpdate,
    connectionError: mode === 'socket' ? socket.connectionError : null
  }
}