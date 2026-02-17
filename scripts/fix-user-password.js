const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserPassword() {
  try {
    console.log('🔧 Resetando senha do usuário Jackson Felipe...\n')
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: 'lider_infra@empresa.com' },
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
    
    // Pegar o hash de um usuário que sabemos que funciona (admin)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@empresa.com' },
      include: { accounts: true }
    })
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado')
      return
    }
    
    const adminAccount = adminUser.accounts.find(acc => acc.providerId === 'credential')
    
    if (!adminAccount) {
      console.log('❌ Conta admin não encontrada')
      return
    }
    
    console.log('📋 Hash do admin:', adminAccount.password.substring(0, 50) + '...')
    console.log('📋 Hash do Jackson:', account.password.substring(0, 50) + '...\n')
    
    // Copiar o formato do hash do admin e criar um novo para "lider123"
    // Vamos usar o mesmo salt do admin para testar
    const [adminSalt, adminHash] = adminAccount.password.split(':')
    
    console.log('🔨 Criando novo hash para senha "lider123"...')
    
    const crypto = require('crypto')
    const newPassword = 'lider123'
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha256').toString('hex')
    const hashedPassword = `${newSalt}:${newHash}`
    
    console.log('📝 Novo hash:', hashedPassword.substring(0, 50) + '...\n')
    
    // Atualizar a senha
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Senha atualizada com sucesso!\n')
    console.log('📝 Faça login com:')
    console.log('   Usuário: jackson')
    console.log('   Senha: lider123')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserPassword()
