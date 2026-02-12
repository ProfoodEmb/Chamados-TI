const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllTickets() {
  try {
    console.log('🗑️  Iniciando limpeza de chamados...')

    // Deletar todas as mensagens primeiro (relacionamento)
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`✅ ${deletedMessages.count} mensagens deletadas`)

    // Deletar todos os tickets
    const deletedTickets = await prisma.ticket.deleteMany({})
    console.log(`✅ ${deletedTickets.count} chamados deletados`)

    console.log('🎉 Limpeza concluída com sucesso!')
    console.log('📊 Banco de dados limpo e pronto para novos chamados!')
  } catch (error) {
    console.error('❌ Erro ao limpar chamados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllTickets()
