const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    console.log('🔄 Investigando o hash da senha...\n')
    
    // Buscar TODOS os usuários para comparar os hashes
    const users = await prisma.user.findMany({
      include: { accounts: true }
    })

    console.log('👥 Usuários encontrados:\n')
    
    for (const user of users) {
      const account = user.accounts.find(acc => acc.providerId === 'credential')
      if (account && account.password) {
        console.log(`📧 ${user.email}`)
        console.log(`   Nome: ${user.name}`)
        console.log(`   Hash: ${account.password}`)
        console.log(`   Tamanho: ${account.password.length}`)
        console.log(`   Formato: ${account.password.includes(':') ? 'salt:hash' : 'outro'}`)
        console.log('')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
