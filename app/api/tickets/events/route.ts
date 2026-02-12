import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Store para manter as conexões ativas
const connections = new Set<ReadableStreamDefaultController>()

// Função para notificar todas as conexões
export function notifyTicketUpdate(data: any) {
  console.log('📢 [SSE API] Notificando:', data.type, '| Conexões ativas:', connections.size)
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  let successCount = 0
  let failCount = 0
  
  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message))
      successCount++
    } catch (error) {
      // Remove conexões mortas
      console.log('❌ [SSE API] Removendo conexão morta')
      connections.delete(controller)
      failCount++
    }
  })
  
  console.log(`📢 [SSE API] Enviado para ${successCount} conexões, ${failCount} falharam`)
}

export async function GET(request: NextRequest) {
  console.log('🔌 [SSE API] Nova conexão SSE solicitada')
  
  const stream = new ReadableStream({
    start(controller) {
      // Adicionar conexão ao store
      connections.add(controller)
      console.log('✅ [SSE API] Conexão adicionada. Total de conexões:', connections.size)
      
      // Enviar mensagem inicial
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', message: 'SSE connected', timestamp: new Date().toISOString() })}\n\n`
      controller.enqueue(new TextEncoder().encode(initialMessage))
      console.log('📤 [SSE API] Mensagem inicial enviada')
      
      // Cleanup quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        connections.delete(controller)
        console.log('🔌 [SSE API] Conexão removida (abort). Total:', connections.size)
        try {
          controller.close()
        } catch (error) {
          // Ignorar erros de controller já fechado
        }
      })
    },
    cancel(controller) {
      connections.delete(controller)
      console.log('🔌 [SSE API] Conexão cancelada. Total:', connections.size)
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
