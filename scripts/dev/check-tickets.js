const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        requester: true,
        assignedTo: true
      }
    })

    console.log('\n=== TICKETS NO BANCO ===')
    console.log('Total de tickets:', tickets.length)
    console.log('')

    tickets.forEach(ticket => {
      console.log(`Ticket #${ticket.number}`)
      console.log(`  Assunto: ${ticket.subject}`)
      console.log(`  Team: ${ticket.team || 'NULL'}`)
      console.log(`  Status: ${ticket.status}`)
      console.log(`  Solicitante: ${ticket.requester.name}`)
      console.log(`  Responsável: ${ticket.assignedTo?.name || 'Não atribuído'}`)
      console.log('')
    })

    // Verificar usuários
    const users = await prisma.user.findMany()
    console.log('\n=== USUÁRIOS NO BANCO ===')
    users.forEach(user => {
      console.log(`${user.name} - Role: ${user.role} - Team: ${user.team || 'NULL'}`)
    })

  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTickets()
