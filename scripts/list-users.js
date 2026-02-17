const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true
      }
    })

    console.log('📋 Usuários cadastrados:')
    users.forEach(user => {
      console.log(`- ${user.name} (@${user.username}) - Email: ${user.email} - ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
