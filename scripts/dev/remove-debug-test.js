const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeDebugTest() {
  try {
    const result = await prisma.notice.deleteMany({
      where: {
        title: {
          contains: 'Debug Test'
        }
      }
    })

    console.log(`✅ ${result.count} aviso(s) de debug removido(s)`)
    
  } catch (error) {
    console.error('❌ Erro ao remover avisos de debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeDebugTest()