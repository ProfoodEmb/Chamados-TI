const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixTicketNumbers() {
  try {
    console.log('🔧 Padronizando números dos chamados...\n')
    
    // Buscar todos os tickets ordenados por data de criação
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`📋 Total de tickets encontrados: ${tickets.length}\n`)

    // Atualizar cada ticket com número sequencial
    for (let i = 0; i < tickets.length; i++) {
      const newNumber = String(i + 1).padStart(6, '0') // Ex: 000001, 000002, etc
      const ticket = tickets[i]
      
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { number: newNumber }
      })
      
      console.log(`✅ Ticket ${ticket.number} → ${newNumber}`)
    }

    console.log('\n✨ Todos os números foram padronizados com sucesso!')
    console.log(`📊 Próximo número disponível: ${String(tickets.length + 1).padStart(6, '0')}`)
    
  } catch (error) {
    console.error('❌ Erro ao padronizar números:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTicketNumbers()
