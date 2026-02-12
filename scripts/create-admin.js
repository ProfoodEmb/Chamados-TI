const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Criando usuário admin...')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@tuicial.com',
      username: 'admin',
      role: 'lider_infra',
      team: 'infra',
      status: 'ativo',
      emailVerified: true,
    }
  })

  console.log('✅ Usuário criado:', user.email)

  // Criar conta de autenticação
  await prisma.account.create({
    data: {
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: hashedPassword,
    }
  })

  console.log('✅ Credenciais configuradas')
  console.log('\n📋 Dados de acesso:')
  console.log('   Email: admin@tuicial.com')
  console.log('   Senha: admin123')
  console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
