const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAllAutoAssignRules() {
  console.log('🧪 Testando todas as regras de auto-atribuição...\n')

  try {
    // Buscar usuários
    const jackson = await prisma.user.findFirst({
      where: { username: 'lider_infra' }
    })

    const rafael = await prisma.user.findFirst({
      where: { username: 'rafael.silva' }
    })

    const testUser = await prisma.user.findFirst({
      where: { role: 'user' }
    })

    if (!jackson || !rafael || !testUser) {
      console.log('❌ Usuários necessários não encontrados')
      return
    }

    console.log('✅ Usuários encontrados:')
    console.log(`  - Jackson: ${jackson.name}`)
    console.log(`  - Rafael: ${rafael.name}`)
    console.log(`  - Usuário teste: ${testUser.name}\n`)

    // Função auxiliar para criar ticket
    const createTestTicket = async (testName, data, expectedAssignee) => {
      const lastTicket = await prisma.ticket.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { number: true }
      })

      let ticketNumber = '000001'
      if (lastTicket) {
        const lastNumber = parseInt(lastTicket.number)
        ticketNumber = String(lastNumber + 1).padStart(6, '0')
      }

      console.log(`📋 Teste: ${testName}`)
      console.log(`  - Team: ${data.team || 'N/A'}`)
      console.log(`  - Category: ${data.category || 'N/A'}`)
      console.log(`  - Service: ${data.service || 'N/A'}`)
      console.log(`  - Esperado: ${expectedAssignee.name}`)

      const ticket = await prisma.ticket.create({
        data: {
          number: ticketNumber,
          subject: `Teste: ${testName}`,
          description: `Ticket de teste para ${testName}`,
          category: data.category || 'Geral',
          urgency: 'medium',
          status: 'Aberto',
          kanbanStatus: 'inbox',
          team: data.team || null,
          service: data.service || null,
          requesterId: testUser.id,
          assignedToId: expectedAssignee.id,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true }
          }
        }
      })

      const success = ticket.assignedTo?.id === expectedAssignee.id
      console.log(`  - Resultado: ${ticket.assignedTo?.name || 'Ninguém'}`)
      console.log(`  - Status: ${success ? '✅ PASSOU' : '❌ FALHOU'}\n`)

      return success
    }

    // Testes
    const results = []

    // Teste 1: Automação de Sistemas → Jackson
    results.push(await createTestTicket(
      'Automação de Sistemas',
      { team: 'sistemas', category: 'Automação' },
      jackson
    ))

    // Teste 2: eCalc (service) → Rafael
    results.push(await createTestTicket(
      'eCalc (service)',
      { team: 'sistemas', service: 'eCalc', category: 'Suporte' },
      rafael
    ))

    // Teste 3: eCalc (category) → Rafael
    results.push(await createTestTicket(
      'eCalc (category)',
      { team: 'sistemas', category: 'eCalc' },
      rafael
    ))

    // Teste 4: Questor (service) → Rafael
    results.push(await createTestTicket(
      'Questor (service)',
      { team: 'sistemas', service: 'Questor', category: 'Suporte' },
      rafael
    ))

    // Teste 5: Questor (category) → Rafael
    results.push(await createTestTicket(
      'Questor (category)',
      { team: 'sistemas', category: 'Questor' },
      rafael
    ))

    // Teste 6: Outros tickets de Sistemas → Rafael
    results.push(await createTestTicket(
      'Outros Sistemas',
      { team: 'sistemas', category: 'Suporte' },
      rafael
    ))

    // Resumo
    const passed = results.filter(r => r).length
    const total = results.length

    console.log('═══════════════════════════════════════')
    console.log(`📊 RESUMO: ${passed}/${total} testes passaram`)
    console.log('═══════════════════════════════════════')

    if (passed === total) {
      console.log('🎉 TODOS OS TESTES PASSARAM!')
    } else {
      console.log('⚠️  Alguns testes falharam')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAllAutoAssignRules()
