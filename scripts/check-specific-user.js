const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSpecificUser() {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: 'Específico'
        }
      }
    })
    
    console.log('Usuários encontrados:', JSON.stringify(users, null, 2))
    
    if (users.length === 0) {
      console.log('\n❌ Usuário "Usuário Específico" não encontrado!')
      console.log('Criando usuário...')
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Usuário Específico',
          email: 'usuario.especifico@sistema.local',
          username: 'usuario_especifico',
          role: 'user',
          team: 'geral',
          emailVerified: false
        }
      })
      
      console.log('✅ Usuário criado:', JSON.stringify(newUser, null, 2))
    } else {
      console.log('✅ Usuário "Usuário Específico" já existe!')
    }
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificUser()
