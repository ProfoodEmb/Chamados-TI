const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJacksonData() {
  console.log('🔍 Verificando dados do Jackson...\n')

  try {
    // Buscar Jackson
    const jackson = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'lider_infra' },
          { name: { contains: 'Jackson' } }
        ]
      }
    })

    if (!jackson) {
      console.log('❌ Jackson não encontrado no banco')
      return
    }

    console.log('👤 Dados do Jackson:')
    console.log(`  - ID: ${jackson.id}`)
    console.log(`  - Nome: ${jackson.name}`)
    console.log(`  - Username: ${jackson.username}`)
    console.log(`  - Role: ${jackson.role}`)
    console.log(`  - Team: ${jackson.team}`)
    console.log(`  - Status: ${jackson.status}`)

    // Verificar tickets atribuídos ao Jackson
    const assignedTickets = await prisma.ticket.count({
      where: { assignedToId: jackson.id }
    })

    console.log(`\n📋 Tickets atribuídos ao Jackson: ${assignedTickets}`)

    // Verificar tickets criados pelo Jackson
    const createdTickets = await prisma.ticket.count({
      where: { requesterId: jackson.id }
    })

    console.log(`📋 Tickets criados pelo Jackson: ${createdTickets}`)

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJacksonData()
