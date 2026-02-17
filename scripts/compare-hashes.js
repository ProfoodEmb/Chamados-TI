const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function compareHashes() {
  try {
    // Pegar hash do lider_infra (criado pelo Better Auth - funciona)
    const liderInfra = await prisma.user.findFirst({
      where: { username: 'lider_infra' },
      include: { accounts: { where: { providerId: 'credential' } } }
    })

    // Pegar hash do usuario (atualizado manualmente - não funciona)
    const usuario = await prisma.user.findFirst({
      where: { username: 'usuario' },
      include: { accounts: { where: { providerId: 'credential' } } }
    })

    if (!liderInfra || !usuario) {
      console.log('❌ Usuários não encontrados')
      return
    }

    const liderHash = liderInfra.accounts[0]?.password
    const usuarioHash = usuario.accounts[0]?.password

    console.log('🔐 Hash do lider_infra (FUNCIONA):')
    console.log(liderHash)
    console.log('\nTamanho:', liderHash?.length)
    console.log('Formato:', liderHash?.includes(':') ? 'salt:hash' : 'outro')
    if (liderHash?.includes(':')) {
      const [salt, hash] = liderHash.split(':')
      console.log('Salt length:', salt.length)
      console.log('Hash length:', hash.length)
    }

    console.log('\n' + '='.repeat(80))

    console.log('\n🔐 Hash do usuario (NÃO FUNCIONA):')
    console.log(usuarioHash)
    console.log('\nTamanho:', usuarioHash?.length)
    console.log('Formato:', usuarioHash?.includes(':') ? 'salt:hash' : 'outro')
    if (usuarioHash?.includes(':')) {
      const [salt, hash] = usuarioHash.split(':')
      console.log('Salt length:', salt.length)
      console.log('Hash length:', hash.length)
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📊 Comparação:')
    console.log('Mesmo formato?', liderHash?.includes(':') === usuarioHash?.includes(':'))
    console.log('Mesmo tamanho?', liderHash?.length === usuarioHash?.length)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compareHashes()
