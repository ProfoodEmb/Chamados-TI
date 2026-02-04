import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: ServerIO
    }
  }
}

let globalIO: ServerIO | null = null

export function initializeSocketIO(server: NetServer): ServerIO {
  if (globalIO) {
    return globalIO
  }

  console.log('🚀 Inicializando Socket.IO server...')
  
  globalIO = new ServerIO(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: [
        "http://localhost:3000",
        "http://192.168.3.115:3000",
        "http://localhost:3001",
        "http://192.168.3.115:3001"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  globalIO.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id)

    socket.on('join-room', (room) => {
      socket.join(room)
      console.log(`📥 Cliente ${socket.id} entrou na sala: ${room}`)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Cliente desconectado:', socket.id, 'Razão:', reason)
    })

    socket.on('error', (error) => {
      console.error('🚨 Erro no socket:', error)
    })

    // Enviar confirmação de conexão
    socket.emit('connected', { message: 'Conectado ao Socket.IO', id: socket.id })
  })

  console.log('✅ Socket.IO server inicializado com sucesso')
  return globalIO
}

export function getSocketIO(req: NextApiRequest, res: NextApiResponseServerIO): ServerIO {
  if (!res.socket.server.io) {
    res.socket.server.io = initializeSocketIO(res.socket.server)
  }
  
  if (!globalIO) {
    globalIO = res.socket.server.io
  }

  return res.socket.server.io
}

export function notifyTicketUpdate(data: any): boolean {
  // Tentar usar o globalIO primeiro
  if (globalIO) {
    console.log('📢 Notificando via Socket.IO (global):', data.type)
    globalIO.emit('ticket-update', data)
    return true
  }
  
  console.warn('⚠️ Socket.IO não inicializado - não foi possível notificar')
  return false
}

// Função para garantir que o Socket.IO seja inicializado
export function ensureSocketIO(): void {
  if (!globalIO) {
    console.log('🔄 Tentando inicializar Socket.IO via fetch...')
    // Fazer uma requisição para inicializar o Socket.IO
    fetch('/api/socketio')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Socket.IO inicializado via fetch:', data)
      })
      .catch(err => {
        console.error('❌ Erro ao inicializar Socket.IO via fetch:', err)
      })
  }
}