import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketRealtimeOptions {
  onTicketUpdate?: () => void
  onMessageUpdate?: () => void
  enabled?: boolean
}

export function useSocketRealtime(options: SocketRealtimeOptions = {}) {
  const { onTicketUpdate, onMessageUpdate, enabled = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔌 Conectando ao Socket.IO...')

    // Inicializar Socket.IO
    const socket = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    socketRef.current = socket

    // Eventos de conexão
    socket.on('connect', () => {
      console.log('✅ Conectado ao Socket.IO:', socket.id)
      setIsConnected(true)
    })

    socket.on('connected', (data) => {
      console.log('📡 Confirmação do servidor:', data)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado do Socket.IO:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('🚨 Erro de conexão Socket.IO:', error)
      setIsConnected(false)
    })

    // Eventos de atualização
    socket.on('ticket-update', (data) => {
      console.log('📢 Atualização de ticket recebida:', data)
      setLastUpdate(new Date())
      
      if (data.type === 'ticket_created' || data.type === 'ticket_updated') {
        onTicketUpdate?.()
      }
      
      if (data.type === 'message_created') {
        onMessageUpdate?.()
      }
    })

    return () => {
      cleanup()
    }
  }, [enabled, onTicketUpdate, onMessageUpdate])

  const cleanup = () => {
    if (socketRef.current) {
      console.log('🔌 Desconectando Socket.IO...')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
  }

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada via Socket.IO')
    setLastUpdate(new Date())
    onTicketUpdate?.()
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
    forceUpdate,
  }
}
