import { NextApiRequest } from 'next'
import { getSocketIO, NextApiResponseServerIO } from '@/lib/socket-server'

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // Inicializar Socket.IO
      const io = getSocketIO(req, res)
      
      res.status(200).json({
        success: true,
        message: 'Socket.IO server initialized',
        connections: io.engine.clientsCount,
        path: '/api/socketio'
      })
    } catch (error) {
      console.error('Erro ao inicializar Socket.IO:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao inicializar Socket.IO',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}