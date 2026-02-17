const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function copyPassword() {
  try {
    const liderInfra = await prisma.user.findFirst({
      where: { username: 'lider_infra' },
      include: { accounts: { where: { providerId: 'credential' } } }
    })

    const usuario = await prisma.user.findFirst({
      where: { username: 'usuario' },
      include: { accounts: { where: { providerId: 'credential' } } }
    })

    if (!liderInfra?.accounts[0] || !usuario?.accounts[0]) {
      console.log('❌ Contas não encontradas')
      return
    }

    console.log('🔄 Copiando senha do lider_infra para usuario...')
    console.log('Senha do lider_infra: lider123')

    await prisma.account.update({
      where: { id: usuario.accounts[0].id },
      data: { password: liderInfra.accounts[0].password }
    })

    console.log('✅ Senha copiada!')
    console.log('\n📝 Agora tente fazer login com:')
    console.log('   Username: usuario')
    console.log('   Senha: lider123')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

copyPassword()
