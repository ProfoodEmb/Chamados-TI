const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeTestTickets() {
  try {
    console.log('🗑️ Removendo chamados de teste...')
    
    // Buscar todos os tickets criados recentemente (últimas 2 horas)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    const testTickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo
        }
      },
      select: {
        id: true,
        number: true,
        subject: true,
        createdAt: true
      }
    })

    console.log(`📋 Encontrados ${testTickets.length} tickets criados nas últimas 2 horas:`)
    testTickets.forEach(ticket => {
      console.log(`   - #${ticket.number}: ${ticket.subject}`)
    })

    if (testTickets.length === 0) {
      console.log('✅ Nenhum ticket de teste encontrado para remover.')
      return
    }

    // Confirmar remoção
    console.log('\n🔄 Removendo tickets...')

    // Deletar mensagens relacionadas
    for (const ticket of testTickets) {
      await prisma.message.deleteMany({
        where: { ticketId: ticket.id }
      })
      
      await prisma.attachment.deleteMany({
        where: { ticketId: ticket.id }
      })
    }

    // Deletar os tickets
    const deleteResult = await prisma.ticket.deleteMany({
      where: {
        id: {
          in: testTickets.map(t => t.id)
        }
      }
    })

    console.log(`✅ ${deleteResult.count} tickets removidos com sucesso!`)
    
    // Verificar se ainda existem tickets
    const remainingTickets = await prisma.ticket.count()
    console.log(`📊 Tickets restantes no sistema: ${remainingTickets}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeTestTickets()