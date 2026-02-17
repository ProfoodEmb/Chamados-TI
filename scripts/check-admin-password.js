const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function checkAdminPassword() {
  try {
    // Buscar o usuário admin
    const user = await prisma.user.findFirst({
      where: { username: 'admin' }
    })

    if (!user) {
      console.log('❌ Usuário admin não encontrado')
      return
    }

    console.log('✅ Usuário admin encontrado:', user.name, user.email)

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

    console.log('✅ Conta encontrada')
    console.log('📝 Hash da senha:', account.password)

    // Testar algumas senhas comuns
    const testPasswords = ['admin', 'admin123', '123456', 'password', 'profood']
    
    console.log('\n🔐 Testando senhas comuns...')
    
    if (account.password) {
      const [salt, storedHash] = account.password.split(':')
      
      for (const testPassword of testPasswords) {
        const hash = crypto.pbkdf2Sync(testPassword, salt, 10000, 64, 'sha256').toString('hex')
        
        if (hash === storedHash) {
          console.log(`✅ SENHA ENCONTRADA: "${testPassword}"`)
          return
        }
      }
      
      console.log('❌ Nenhuma senha comum funcionou')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPassword()
