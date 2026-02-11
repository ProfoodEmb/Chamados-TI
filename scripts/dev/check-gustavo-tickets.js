const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkGustavoTickets() {
  try {
    console.log('🔍 Verificando tickets do Gustavo...\n')

    // Buscar Gustavo
    const gustavo = await prisma.user.findFirst({
      where: { name: { contains: 'Gustavo' } }
    })

    if (!gustavo) {
      console.log('❌ Gustavo não encontrado!')
      return
    }

    console.log('👤 Gustavo encontrado:', gustavo.name, `(${gustavo.id})`)
    console.log('   Team:', gustavo.team)
    console.log('   Role:', gustavo.role)

    // Tickets atribuídos ao Gustavo
    const assignedTickets = await prisma.ticket.findMany({
      where: { assignedToId: gustavo.id },
      select: {
        id: true,
        number: true,
        subject: true,
        status: true,
        kanbanStatus: true,
        rating: true,
        team: true
      }
    })

    console.log('\n📋 Tickets atribuídos ao Gustavo:', assignedTickets.length)
    assignedTickets.forEach(t => {
      console.log(`  - #${t.number}: ${t.subject}`)
      console.log(`    Status: ${t.status} | Kanban: ${t.kanbanStatus} | Team: ${t.team}`)
      console.log(`    Avaliação: ${t.rating || 'Sem avaliação'}`)
    })

    // Tickets com avaliação
    const ratedTickets = assignedTickets.filter(t => t.rating !== null)
    console.log('\n⭐ Tickets com avaliação:', ratedTickets.length)

    // Tickets concluídos
    const doneTickets = assignedTickets.filter(t => t.kanbanStatus === 'done')
    console.log('✅ Tickets concluídos:', doneTickets.length)

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGustavoTickets()
