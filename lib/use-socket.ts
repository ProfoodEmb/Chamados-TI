import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketOptions {
  onTicketUpdate?: (data: any) => void
  enabled?: boolean
}

export function useSocket(options: SocketOptions = {}) {
  const { onTicketUpdate, enabled = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔌 Conectando ao Socket.IO...')
    
    // Criar conexão Socket.IO
    const socket = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    // Event listeners
    socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', socket.id)
      setIsConnected(true)
      setConnectionError(null)
      setLastUpdate(new Date())
      
      // Entrar na sala de tickets
      socket.emit('join-room', 'tickets')
      
      // Limpar timeout de reconexão se existir
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    })

    socket.on('connected', (data) => {
      console.log('🎉 Confirmação de conexão recebida:', data)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO desconectado:', reason)
      setIsConnected(false)
      setConnectionError(`Desconectado: ${reason}`)
      
      // Tentar reconectar após um delay se a desconexão não foi intencional
      if (reason !== 'io client disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Tentando reconectar...')
          socket.connect()
        }, 2000)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('🚨 Erro de conexão Socket.IO:', error)
      setIsConnected(false)
      setConnectionError(`Erro de conexão: ${error.message}`)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconectado após', attemptNumber, 'tentativas')
      setIsConnected(true)
      setConnectionError(null)
      setLastUpdate(new Date())
    })

    socket.on('reconnect_error', (error) => {
      console.error('🚨 Erro de reconexão:', error)
      setConnectionError(`Erro de reconexão: ${error.message}`)
    })

    socket.on('ticket-update', (data) => {
      console.log('📨 Atualização de ticket recebida via Socket.IO:', data)
      setLastUpdate(new Date())
      onTicketUpdate?.(data)
    })

    // Inicializar servidor Socket.IO fazendo uma requisição
    const initializeServer = async () => {
      try {
        const response = await fetch('/api/socketio', { method: 'POST' })
        const data = await response.json()
        console.log('🚀 Socket.IO server status:', data)
      } catch (err) {
        console.error('❌ Erro ao inicializar Socket.IO server:', err)
      }
    }

    // Inicializar servidor antes de conectar
    initializeServer().then(() => {
      // Pequeno delay para garantir que o servidor esteja pronto
      setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          console.log('🔄 Tentando conectar após inicialização do servidor...')
          socketRef.current.connect()
        }
      }, 1000)
    })

    // Cleanup
    return cleanup
  }, [enabled, onTicketUpdate])

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      console.log('🔌 Desconectando Socket.IO...')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    setConnectionError(null)
  }

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada via Socket.IO')
    onTicketUpdate?.({ type: 'force_update' })
    setLastUpdate(new Date())
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
    connectionError,
    forceUpdate,
    socket: socketRef.current
  }
}