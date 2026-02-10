const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteAllTickets() {
  try {
    console.log('🗑️  Deletando todos os chamados...')
    
    // Deletar todas as mensagens primeiro (por causa da relação)
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`✅ ${deletedMessages.count} mensagens deletadas`)
    
    // Deletar todos os tickets
    const deletedTickets = await prisma.ticket.deleteMany({})
    console.log(`✅ ${deletedTickets.count} tickets deletados`)
    
    console.log('\n✨ Todos os chamados foram deletados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao deletar chamados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllTickets()
