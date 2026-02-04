import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Store para manter as conexões ativas
const connections = new Set<ReadableStreamDefaultController>()

// Função para notificar todas as conexões
export function notifyTicketUpdate(data: any) {
  console.log('Notificando SSE:', data.type, connections.size, 'conexões')
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message))
    } catch (error) {
      // Remove conexões mortas
      console.log('Removendo conexão morta')
      connections.delete(controller)
    }
  })
}

export async function GET(request: NextRequest) {
  console.log('Nova conexão SSE solicitada')
  
  const stream = new ReadableStream({
    start(controller) {
      // Adicionar conexão ao store
      connections.add(controller)
      console.log('Conexão SSE adicionada. Total:', connections.size)
      
      // Enviar mensagem inicial
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`
      controller.enqueue(new TextEncoder().encode(initialMessage))
      
      // Cleanup quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        connections.delete(controller)
        console.log('Conexão SSE removida. Total:', connections.size)
        try {
          controller.close()
        } catch (error) {
          // Ignorar erros de controller já fechado
        }
      })
    },
    cancel(controller) {
      connections.delete(controller)
      console.log('Conexão SSE cancelada. Total:', connections.size)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}