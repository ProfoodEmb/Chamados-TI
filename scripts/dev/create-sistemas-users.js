const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSistemasUsers() {
  try {
    console.log('👥 Criando usuários da equipe de Sistemas...\n')

    // Criar Rafael
    const rafael = await prisma.user.create({
      data: {
        name: 'Rafael Silva',
        email: 'rafael.silva@empresa.com',
        username: 'rafael.silva',
        role: 'func_sistemas',
        team: 'sistemas',
        setor: 'TI',
        empresa: 'profood',
        status: 'ativo',
        emailVerified: true
      }
    })
    console.log('✅ Rafael Silva criado')

    // Criar Danilo
    const danilo = await prisma.user.create({
      data: {
        name: 'Danilo Santos',
        email: 'danilo.santos@empresa.com',
        username: 'danilo.santos',
        role: 'func_sistemas',
        team: 'sistemas',
        setor: 'TI',
        empresa: 'profood',
        status: 'ativo',
        emailVerified: true
      }
    })
    console.log('✅ Danilo Santos criado')

    // Criar conta (password) para ambos
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('senha123', 10)

    await prisma.account.create({
      data: {
        userId: rafael.id,
        accountId: rafael.id,
        providerId: 'credential',
        password: hashedPassword
      }
    })

    await prisma.account.create({
      data: {
        userId: danilo.id,
        accountId: danilo.id,
        providerId: 'credential',
        password: hashedPassword
      }
    })

    console.log('\n✅ Usuários criados com sucesso!')
    console.log('   Username: rafael.silva | Senha: senha123')
    console.log('   Username: danilo.santos | Senha: senha123')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSistemasUsers()
