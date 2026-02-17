const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function resetAllPasswords() {
  try {
    const users = [
      { username: 'admin', newPassword: 'admin123' },
      { username: 'Jackson', newPassword: 'jackson19' }
    ]

    for (const userData of users) {
      console.log(`\n🔄 Resetando senha de ${userData.username}...`)
      
      // Buscar o usuário
      const user = await prisma.user.findFirst({
        where: { username: userData.username }
      })

      if (!user) {
        console.log(`❌ Usuário ${userData.username} não encontrado`)
        continue
      }

      console.log(`✅ Usuário encontrado: ${user.name}`)

      // Buscar a conta
      const account = await prisma.account.findFirst({
        where: { 
          userId: user.id,
          providerId: 'credential'
        }
      })

      if (!account) {
        console.log(`❌ Conta credential não encontrada para ${userData.username}`)
        continue
      }

      // Gerar hash da nova senha
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.pbkdf2Sync(userData.newPassword, salt, 10000, 64, 'sha256').toString('hex')
      const hashedPassword = `${salt}:${hash}`

      // Atualizar senha
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
      })

      console.log(`✅ Senha atualizada para: ${userData.newPassword}`)
      
      // Verificar
      const [newSalt, newHash] = hashedPassword.split(':')
      const testHash = crypto.pbkdf2Sync(userData.newPassword, newSalt, 10000, 64, 'sha256').toString('hex')
      
      if (testHash === newHash) {
        console.log(`✅ Verificação OK`)
      } else {
        console.log(`❌ Verificação FALHOU`)
      }
    }

    console.log('\n📋 RESUMO:')
    console.log('- admin: admin123')
    console.log('- Jackson: jackson19')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllPasswords()
