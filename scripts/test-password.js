const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    // Buscar o usuário jackson
    const user = await prisma.user.findFirst({
      where: { username: 'Jackson' }
    })

    if (!user) {
      console.log('❌ Usuário jackson não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.id, user.name)

    // Buscar a conta
    const account = await prisma.account.findFirst({
      where: { 
        userId: user.id,
        providerId: 'credential'
      }
    })

    if (!account) {
      console.log('❌ Conta credential não encontrada')
      return
    }

    console.log('✅ Conta encontrada:', account.id)
    console.log('📝 Senha atual (hash):', account.password?.substring(0, 50) + '...')

    // Testar a senha "teste123"
    const testPassword = 'teste123'
    
    if (account.password) {
      const [salt, storedHash] = account.password.split(':')
      const hash = crypto.pbkdf2Sync(testPassword, salt, 10000, 64, 'sha256').toString('hex')
      
      if (hash === storedHash) {
        console.log('✅ Senha "profood" está CORRETA')
      } else {
        console.log('❌ Senha "profood" está INCORRETA')
        console.log('Hash esperado:', storedHash.substring(0, 20) + '...')
        console.log('Hash calculado:', hash.substring(0, 20) + '...')
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()
