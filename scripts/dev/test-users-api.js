const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUsersAPI() {
  console.log('🔍 Testando filtro de usuários por equipe...\n')

  try {
    // Testar filtro de equipe sistemas
    console.log('📋 Buscando usuários da equipe SISTEMAS:')
    const sistemasUsers = await prisma.user.findMany({
      where: {
        team: 'sistemas'
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        team: true,
      }
    })

    console.log(`✅ Encontrados ${sistemasUsers.length} usuários:`)
    sistemasUsers.forEach(user => {
      console.log(`  - ${user.name} (@${user.username}) - ${user.role}`)
    })

    console.log('\n📋 Buscando usuários da equipe INFRA:')
    const infraUsers = await prisma.user.findMany({
      where: {
        team: 'infra'
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        team: true,
      }
    })

    console.log(`✅ Encontrados ${infraUsers.length} usuários:`)
    infraUsers.forEach(user => {
      console.log(`  - ${user.name} (@${user.username}) - ${user.role}`)
    })

    console.log('\n✅ Teste concluído!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUsersAPI()
