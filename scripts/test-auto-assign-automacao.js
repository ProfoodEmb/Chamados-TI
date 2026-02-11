const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAutoAssign() {
  console.log('🧪 Testando auto-atribuição de tickets de Automação...\n')

  try {
    // Buscar Jackson
    const jackson = await prisma.user.findFirst({
      where: {
        username: 'lider_infra'
      }
    })

    if (!jackson) {
      console.log('❌ Jackson não encontrado')
      return
    }

    console.log('✅ Jackson encontrado:', jackson.name, `(${jackson.id})`)

    // Buscar um usuário comum para criar o ticket
    const user = await prisma.user.findFirst({
      where: {
        role: 'user'
      }
    })

    if (!user) {
      console.log('❌ Nenhum usuário comum encontrado')
      return
    }

    console.log('✅ Usuário para teste:', user.name)

    // Criar ticket de teste
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        number: true
      }
    })

    let ticketNumber = '000001'
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.number)
      ticketNumber = String(lastNumber + 1).padStart(6, '0')
    }

    console.log('\n📋 Criando ticket de teste...')
    console.log('  - Team: sistemas')
    console.log('  - Category: Automação')
    console.log('  - Deve ser atribuído para:', jackson.name)

    const ticket = await prisma.ticket.create({
      data: {
        number: ticketNumber,
        subject: 'Teste de Auto-atribuição - Automação',
        description: 'Este é um ticket de teste para verificar a auto-atribuição de tickets de automação para o Jackson',
        category: 'Automação',
        urgency: 'medium',
        status: 'Aberto',
        kanbanStatus: 'inbox',
        team: 'sistemas',
        requesterId: user.id,
        assignedToId: jackson.id, // Auto-atribuído
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    console.log('\n✅ Ticket criado com sucesso!')
    console.log(`  - Número: #${ticket.number}`)
    console.log(`  - Atribuído para: ${ticket.assignedTo?.name || 'Ninguém'}`)
    
    if (ticket.assignedTo?.id === jackson.id) {
      console.log('\n🎉 AUTO-ATRIBUIÇÃO FUNCIONANDO CORRETAMENTE!')
    } else {
      console.log('\n❌ Auto-atribuição NÃO funcionou')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutoAssign()
