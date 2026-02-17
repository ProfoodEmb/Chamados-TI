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

async function testAdminLogin() {
  try {
    console.log('🧪 Testando login do admin...\n')
    
    // Buscar o usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@empresa.com' },
      include: { accounts: true }
    })
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado')
      return
    }
    
    console.log('✅ Admin encontrado:', adminUser.name)
    
    const adminAccount = adminUser.accounts.find(acc => acc.providerId === 'credential')
    
    if (!adminAccount) {
      console.log('❌ Conta admin não encontrada')
      return
    }
    
    console.log('🔐 Hash do admin:', adminAccount.password)
    console.log('📏 Tamanho:', adminAccount.password.length)
    
    // Testar a senha do seed
    const testPassword = 'admin123'
    console.log('\n🧪 Testando senha "admin123"...')
    
    const result = verifyPassword(testPassword, adminAccount.password)
    console.log('✅ Resultado:', result ? 'SENHA CORRETA!' : 'SENHA INCORRETA')
    
    if (result) {
      console.log('\n🎉 O algoritmo está correto!')
      console.log('📝 Agora vou atualizar a senha do Jackson...')
      
      // Buscar Jackson
      const jacksonUser = await prisma.user.findUnique({
        where: { email: 'lider_infra@empresa.com' },
        include: { accounts: true }
      })
      
      if (!jacksonUser) {
        console.log('❌ Usuário Jackson não encontrado')
        return
      }
      
      const jacksonAccount = jacksonUser.accounts.find(acc => acc.providerId === 'credential')
      
      if (!jacksonAccount) {
        console.log('❌ Conta Jackson não encontrada')
        return
      }
      
      // Criar hash para "lider123" usando o mesmo método
      const newPassword = 'lider123'
      const newSalt = crypto.randomBytes(16).toString('hex')
      const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha256').toString('hex')
      const hashedPassword = `${newSalt}:${newHash}`
      
      console.log('🔨 Novo hash criado:', hashedPassword.substring(0, 50) + '...')
      
      // Verificar se o novo hash funciona
      const testNewHash = verifyPassword(newPassword, hashedPassword)
      console.log('🧪 Testando novo hash:', testNewHash ? 'OK' : 'FALHOU')
      
      if (testNewHash) {
        // Atualizar no banco
        await prisma.account.update({
          where: { id: jacksonAccount.id },
          data: { password: hashedPassword }
        })
        
        console.log('\n✅ Senha do Jackson atualizada!')
        console.log('📝 Faça login com:')
        console.log('   Usuário: jackson')
        console.log('   Senha: lider123')
      }
    } else {
      console.log('\n❌ O algoritmo não está correto!')
      console.log('⚠️  O Better Auth pode estar usando um método diferente')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()
