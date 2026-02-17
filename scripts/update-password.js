const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function updatePassword(username, newPassword) {
  try {
    // Buscar o usuário
    const user = await prisma.user.findFirst({
      where: { username }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:', user.name)

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

    // Gerar hash da nova senha
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha256').toString('hex')
    const hashedPassword = `${salt}:${hash}`

    console.log('🔐 Nova senha hash:', hashedPassword.substring(0, 50) + '...')

    // Atualizar senha
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Senha atualizada com sucesso!')

    // Testar a nova senha
    const [newSalt, newStoredHash] = hashedPassword.split(':')
    const testHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha256').toString('hex')
    
    if (testHash === newStoredHash) {
      console.log('✅ Verificação: Nova senha está funcionando')
    } else {
      console.log('❌ Verificação: Algo deu errado')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Atualizar senha do Jackson para "teste123"
updatePassword('Jackson', 'teste123')
