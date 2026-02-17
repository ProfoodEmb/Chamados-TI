const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function verifyPassword(password, storedHash) {
  try {
    if (!storedHash.includes(':')) {
      return false
    }

    const [salt, hash] = storedHash.split(':')
    const derivedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(derivedHash, 'hex')
    )
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return false
  }
}

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'jackson@empresa.com' },
      include: { accounts: true }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.name)
    
    const account = user.accounts.find(acc => acc.providerId === 'credential')
    
    if (!account) {
      console.log('❌ Conta credential não encontrada')
      return
    }

    console.log('\n🔐 Hash armazenado:', account.password.substring(0, 50) + '...')
    
    // Testar várias senhas possíveis
    const possiblePasswords = [
      'lider123',
      'profood',
      'profood2026',
      'jackson19',
      'admin123',
      'lider_infra',
      '123456',
      'password'
    ]
    
    console.log('\n🧪 Testando senhas possíveis...\n')
    
    for (const testPassword of possiblePasswords) {
      const result = verifyPassword(testPassword, account.password)
      console.log(`${result ? '✅' : '❌'} "${testPassword}": ${result ? 'CORRETA!' : 'incorreta'}`)
      if (result) {
        console.log('\n🎉 SENHA ENCONTRADA:', testPassword)
        break
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPassword()
