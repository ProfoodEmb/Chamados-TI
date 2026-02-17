const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function discoverAlgorithm() {
  try {
    console.log('🔍 Descobrindo o algoritmo de hash do Better Auth...\n')
    
    // Buscar o admin (sabemos que admin123 funciona)
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@empresa.com' },
      include: { accounts: true }
    })
    
    if (!admin) {
      console.log('❌ Admin não encontrado')
      return
    }
    
    const adminAccount = admin.accounts.find(acc => acc.providerId === 'credential')
    
    if (!adminAccount) {
      console.log('❌ Conta admin não encontrada')
      return
    }
    
    console.log('✅ Admin encontrado')
    console.log('🔐 Hash do admin:', adminAccount.password)
    console.log('📏 Tamanho:', adminAccount.password.length)
    
    const [salt, hash] = adminAccount.password.split(':')
    console.log('\n📋 Salt:', salt)
    console.log('📋 Salt length:', salt.length)
    console.log('📋 Hash:', hash.substring(0, 20) + '...')
    console.log('📋 Hash length:', hash.length)
    
    // Testar diferentes algoritmos e iterações
    const password = 'admin123'
    const algorithms = ['sha256', 'sha512', 'sha1']
    const iterations = [1, 10, 100, 1000, 10000, 100000, 310000]
    
    console.log('\n🧪 Testando combinações...\n')
    
    for (const algo of algorithms) {
      for (const iter of iterations) {
        try {
          const testHash = crypto.pbkdf2Sync(password, salt, iter, 64, algo).toString('hex')
          if (testHash === hash) {
            console.log('🎉 ENCONTRADO!')
            console.log('   Algoritmo:', algo)
            console.log('   Iterações:', iter)
            console.log('   Tamanho da chave:', 64, 'bytes')
            return
          }
        } catch (e) {
          // Ignorar erros
        }
      }
    }
    
    console.log('❌ Algoritmo não encontrado nas combinações testadas')
    console.log('\n💡 Vou testar se o Better Auth está usando scrypt...')
    
    // Testar scrypt
    try {
      const testHash = crypto.scryptSync(password, salt, 64).toString('hex')
      if (testHash === hash) {
        console.log('🎉 ENCONTRADO! O Better Auth usa scrypt!')
        return
      }
    } catch (e) {
      console.log('❌ Não é scrypt')
    }
    
    console.log('\n⚠️  O Better Auth pode estar usando um algoritmo customizado')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

discoverAlgorithm()
