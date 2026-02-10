const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTicketsForGustavo() {
  try {
    console.log('🎫 Criando tickets para o Gustavo...\n')

    // Buscar Gustavo
    const gustavo = await prisma.user.findFirst({
      where: { name: { contains: 'Gustavo' } }
    })

    if (!gustavo) {
      console.log('❌ Gustavo não encontrado!')
      return
    }

    // Buscar um usuário para ser o solicitante
    const requester = await prisma.user.findFirst({
      where: { role: { not: 'admin' } }
    })

    console.log('👤 Gustavo:', gustavo.name)
    console.log('👤 Solicitante:', requester.name)

    // Criar 5 tickets para o Gustavo
    const tickets = []
    
    for (let i = 1; i <= 5; i++) {
      const ticket = await prisma.ticket.create({
        data: {
          number: `TICKET-GUSTAVO-${Date.now()}-${i}`,
          subject: `Ticket de teste ${i} - Gustavo`,
          description: `Descrição do ticket ${i} para testar métricas do Gustavo`,
          category: i % 2 === 0 ? 'Hardware' : 'Software',
          urgency: ['low', 'medium', 'high'][i % 3],
          status: i <= 3 ? 'Concluído' : 'Em Andamento',
          kanbanStatus: i <= 3 ? 'done' : 'in_progress',
          team: 'infra',
          requesterId: requester.id,
          assignedToId: gustavo.id,
          rating: i <= 3 ? [5, 4, 5][i - 1] : null,
          feedback: i <= 3 ? `Ótimo atendimento do Gustavo no ticket ${i}` : null,
          createdAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000), // Últimos 7 dias
          updatedAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000)
        }
      })
      tickets.push(ticket)
      console.log(`✅ Ticket ${i} criado: ${ticket.number}`)
    }

    console.log(`\n✅ ${tickets.length} tickets criados para o Gustavo!`)
    console.log('   - 3 concluídos com avaliações (5, 4, 5)')
    console.log('   - 2 em andamento')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTicketsForGustavo()
