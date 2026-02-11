const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeAllTickets() {
  try {
    console.log('🗑️ Iniciando remoção de todos os chamados...')

    // 1. Remover todas as mensagens
    const messagesDeleted = await prisma.message.deleteMany({})
    console.log(`📧 Removidas ${messagesDeleted.count} mensagens`)

    // 2. Remover todos os anexos
    const attachmentsDeleted = await prisma.attachment.deleteMany({})
    console.log(`📎 Removidos ${attachmentsDeleted.count} anexos`)

    // 3. Remover todos os tickets
    const ticketsDeleted = await prisma.ticket.deleteMany({})
    console.log(`🎫 Removidos ${ticketsDeleted.count} tickets`)

    console.log('✅ Todos os chamados foram removidos com sucesso!')
    console.log(`📊 Total removido: ${ticketsDeleted.count} tickets, ${messagesDeleted.count} mensagens, ${attachmentsDeleted.count} anexos`)

  } catch (error) {
    console.error('❌ Erro ao remover chamados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeAllTickets()