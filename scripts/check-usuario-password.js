const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function checkPassword() {
  try {
    const user = await prisma.user.findFirst({
      where: { username: 'usuario' },
      include: {
        accounts: {
          where: { providerId: 'credential' }
        }
      }
    })

    if (!user || !user.accounts[0]) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário:', user.name)
    console.log('📧 Email:', user.email)
    
    const account = user.accounts[0]
    console.log('🔐 Hash atual:', account.password)

    // Testar senhas
    const testPasswords = ['usuario123', 'tuicial', 'tuicial123']
    
    if (account.password) {
      const [salt, storedHash] = account.password.split(':')
      
      console.log('\n🔍 Testando senhas...')
      for (const pwd of testPasswords) {
        const hash = crypto.pbkdf2Sync(pwd, salt, 10000, 64, 'sha256').toString('hex')
        const match = hash === storedHash
        console.log(`${match ? '✅' : '❌'} "${pwd}": ${match ? 'CORRETA' : 'incorreta'}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPassword()
