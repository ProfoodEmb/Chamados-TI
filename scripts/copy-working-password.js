const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function copyWorkingPassword() {
  try {
    console.log('🔍 Buscando usuários...')
    
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          where: { providerId: 'credential' }
        }
      }
    })

    console.log('\n📋 Usuários e suas senhas:')
    for (const user of users) {
      const account = user.accounts[0]
      if (account) {
        console.log(`\n- ${user.name} (@${user.username})`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Hash: ${account.password?.substring(0, 60)}...`)
      }
    }

    // Copiar a senha do admin para o Jackson
    const admin = users.find(u => u.username === 'admin')
    const jackson = users.find(u => u.username === 'Jackson')

    if (admin && jackson && admin.accounts[0] && jackson.accounts[0]) {
      console.log('\n🔄 Copiando senha do admin para Jackson...')
      
      await prisma.account.update({
        where: { id: jackson.accounts[0].id },
        data: { password: admin.accounts[0].password }
      })

      console.log('✅ Senha copiada!')
      console.log('📝 Agora Jackson tem a mesma senha que admin')
      console.log('⚠️ Teste fazer login com Jackson usando a senha do admin')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

copyWorkingPassword()
