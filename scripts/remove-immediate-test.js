const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeImmediateTest() {
  try {
    const result = await prisma.notice.deleteMany({
      where: {
        title: {
          contains: 'Teste - Publicação Imediata'
        }
      }
    })

    console.log(`✅ ${result.count} aviso(s) de teste removido(s)`)
    
  } catch (error) {
    console.error('❌ Erro ao remover avisos de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeImmediateTest()