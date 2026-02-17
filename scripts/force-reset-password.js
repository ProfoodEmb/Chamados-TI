const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function forceResetPassword() {
  try {
    console.log('🔧 Forçando reset de senha do Jackson...\n')
    
    // Buscar Jackson
    const jackson = await prisma.user.findUnique({
      where: { email: 'jackson@empresa.com' },
      include: { accounts: true }
    })
    
    if (!jackson) {
      console.log('❌ Usuário Jackson não encontrado')
      return
    }
    
    const jacksonAccount = jackson.accounts.find(acc => acc.providerId === 'credential')
    
    if (!jacksonAccount) {
      console.log('❌ Conta Jackson não encontrada')
      return
    }
    
    console.log('✅ Jackson encontrado:', jackson.name)
    console.log('📧 Email:', jackson.email)
    console.log('🔐 Hash atual:', jacksonAccount.password.substring(0, 50) + '...\n')
    
    // Criar uma nova senha temporária: jackson123
    const tempPassword = 'jackson123'
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(tempPassword, salt, 10000, 64, 'sha256').toString('hex')
    const hashedPassword = `${salt}:${hash}`
    
    console.log('🔨 Criando novo hash para senha temporária:', tempPassword)
    console.log('📝 Novo hash:', hashedPassword.substring(0, 50) + '...\n')
    
    // Atualizar no banco
    await prisma.account.update({
      where: { id: jacksonAccount.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Senha resetada com sucesso!\n')
    console.log('📝 Tente fazer login com:')
    console.log('   Usuário: jackson')
    console.log('   Senha:', tempPassword)
    console.log('\n⚠️  IMPORTANTE: Se não funcionar, o Better Auth está usando')
    console.log('   um algoritmo diferente e precisamos investigar mais.')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceResetPassword()
