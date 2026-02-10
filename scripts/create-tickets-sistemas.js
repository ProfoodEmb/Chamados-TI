const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTicketsForSistemas() {
  try {
    console.log('🎫 Criando tickets para a equipe de Sistemas...\n')

    // Buscar usuários de sistemas
    const antony = await prisma.user.findFirst({
      where: { name: { contains: 'Antony' } }
    })

    const rafael = await prisma.user.findFirst({
      where: { name: { contains: 'Rafael' } }
    })

    const danilo = await prisma.user.findFirst({
      where: { name: { contains: 'Danilo' } }
    })

    // Buscar um usuário para ser o solicitante
    const requester = await prisma.user.findFirst({
      where: { role: { not: 'admin' } }
    })

    console.log('👤 Antony:', antony.name)
    console.log('👤 Rafael:', rafael.name)
    console.log('👤 Danilo:', danilo.name)
    console.log('👤 Solicitante:', requester.name)
    console.log()

    const users = [
      { user: antony, name: 'Antony', count: 6 },
      { user: rafael, name: 'Rafael', count: 5 },
      { user: danilo, name: 'Danilo', count: 4 }
    ]

    let totalTickets = 0

    for (const { user, name, count } of users) {
      console.log(`📋 Criando ${count} tickets para ${name}...`)
      
      for (let i = 1; i <= count; i++) {
        const isDone = i <= Math.floor(count * 0.6) // 60% concluídos
        const ticket = await prisma.ticket.create({
          data: {
            number: `TICKET-${name.toUpperCase()}-${Date.now()}-${i}`,
            subject: `Ticket de teste ${i} - ${name}`,
            description: `Descrição do ticket ${i} para testar métricas de ${name}`,
            category: ['Sistema', 'Acesso', 'Relatório', 'Integração'][i % 4],
            urgency: ['low', 'medium', 'high', 'critical'][i % 4],
            status: isDone ? 'Concluído' : 'Em Andamento',
            kanbanStatus: isDone ? 'done' : 'in_progress',
            team: 'sistemas',
            requesterId: requester.id,
            assignedToId: user.id,
            rating: isDone ? [5, 4, 5, 4, 3][i % 5] : null,
            feedback: isDone ? `Ótimo atendimento de ${name} no ticket ${i}` : null,
            createdAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000), // Últimos 10 dias
            updatedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000)
          }
        })
        totalTickets++
      }
      console.log(`  ✅ ${count} tickets criados para ${name}`)
    }

    console.log(`\n✅ Total: ${totalTickets} tickets criados para a equipe de Sistemas!`)
    console.log('   - Antony: 6 tickets (4 concluídos)')
    console.log('   - Rafael: 5 tickets (3 concluídos)')
    console.log('   - Danilo: 4 tickets (2 concluídos)')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTicketsForSistemas()
