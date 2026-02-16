const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixGustavoPassword() {
  try {
    console.log('🔍 Procurando usuário Gustavo...')
    
    // Buscar o usuário Gustavo
    const gustavo = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { contains: 'gustavo', mode: 'insensitive' } },
          { name: { contains: 'gustavo', mode: 'insensitive' } }
        ]
      },
      include: {
        accounts: true
      }
    })

    if (!gustavo) {
      console.error('❌ Usuário Gustavo não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', {
      id: gustavo.id,
      name: gustavo.name,
      username: gustavo.username,
      role: gustavo.role,
      accounts: gustavo.accounts.length
    })

    // Verificar se tem conta credential
    const credentialAccount = gustavo.accounts.find(acc => acc.providerId === 'credential')

    if (!credentialAccount) {
      console.log('⚠️ Conta credential não encontrada. Criando...')
      
      const hashedPassword = await bcrypt.hash('profood', 10)
      
      await prisma.account.create({
        data: {
          userId: gustavo.id,
          accountId: gustavo.id,
          providerId: 'credential',
          password: hashedPassword
        }
      })

      console.log('✅ Conta credential criada com senha: profood')
    } else {
      console.log('✅ Conta credential encontrada:', credentialAccount.id)
      
      // Atualizar senha
      const hashedPassword = await bcrypt.hash('profood', 10)
      
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: hashedPassword }
      })

      console.log('✅ Senha atualizada para: profood')
    }

    // Invalidar sessões
    const deletedSessions = await prisma.session.deleteMany({
      where: { userId: gustavo.id }
    })

    console.log(`✅ ${deletedSessions.count} sessões invalidadas`)

    console.log('\n✅ Gustavo pode fazer login com:')
    console.log(`   Username: ${gustavo.username}`)
    console.log(`   Senha: profood`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixGustavoPassword()
