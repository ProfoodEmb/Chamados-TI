import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTickets() {
  try {
    console.log('🗑️  Iniciando limpeza de chamados...')
    
    // Deletar attachments primeiro (relacionamento)
    const deletedAttachments = await prisma.attachment.deleteMany({})
    console.log(`✓ ${deletedAttachments.count} anexos deletados`)
    
    // Deletar messages (relacionamento)
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`✓ ${deletedMessages.count} mensagens deletadas`)
    
    // Deletar tickets
    const deletedTickets = await prisma.ticket.deleteMany({})
    console.log(`✓ ${deletedTickets.count} chamados deletados`)
    
    console.log('✅ Limpeza concluída com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao limpar chamados:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearTickets()
