const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    console.log('🔍 Buscando usuário Jackson...')
    
    // Buscar o usuário
    const user = await prisma.user.findFirst({
      where: { username: 'Jackson' }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.name, user.email)

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
    console.log('📝 Senha atual:', account.password)
    console.log('📝 Formato:', account.password?.includes(':') ? 'salt:hash' : 'outro formato')

    // Verificar se há outras contas
    const allAccounts = await prisma.account.findMany({
      where: { userId: user.id }
    })

    console.log('\n📋 Todas as contas do usuário:')
    allAccounts.forEach(acc => {
      console.log(`- Provider: ${acc.providerId}`)
      console.log(`  ID: ${acc.id}`)
      console.log(`  Password: ${acc.password?.substring(0, 50)}...`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
