const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n')

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        team: true,
        role: true
      },
      orderBy: {
        team: 'asc'
      }
    })

    console.log('📊 Total de usuários:', allUsers.length)
    console.log('\n👥 Usuários por equipe:\n')

    const infraUsers = allUsers.filter(u => u.team === 'infra')
    const sistemasUsers = allUsers.filter(u => u.team === 'sistemas')
    const adminUsers = allUsers.filter(u => u.team === 'admin')

    console.log('🔧 INFRAESTRUTURA:', infraUsers.length)
    infraUsers.forEach(u => {
      console.log(`  - ${u.name} (@${u.username}) - ${u.role}`)
    })

    console.log('\n💻 SISTEMAS:', sistemasUsers.length)
    sistemasUsers.forEach(u => {
      console.log(`  - ${u.name} (@${u.username}) - ${u.role}`)
    })

    console.log('\n👑 ADMIN:', adminUsers.length)
    adminUsers.forEach(u => {
      console.log(`  - ${u.name} (@${u.username}) - ${u.role}`)
    })

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
