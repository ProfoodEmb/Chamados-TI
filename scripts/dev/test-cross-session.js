const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCrossSession() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR')
    
    console.log('🚀 Criando aviso para testar sincronização entre sessões...')
    console.log('⏰ Horário:', timestamp)

    // Criar aviso para testar sincronização entre sessões
    const notice = await prisma.notice.create({
      data: {
        title: `🔄 Teste Sincronização - ${timestamp}`,
        content: `Este aviso foi criado às ${timestamp} para testar se aparece automaticamente em outras contas/abas abertas.`,
        type: 'info',
        priority: 'medium',
        level: 'general',
        targetSectors: null,
        scheduledFor: null,
        publishedAt: new Date(),
        expiresAt: null,
        active: true,
        authorId: adminUser.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    console.log('✅ Aviso criado com sucesso:')
    console.log('   ID:', notice.id)
    console.log('   Título:', notice.title)
    console.log('   Criado em:', notice.createdAt.toLocaleString('pt-BR'))
    
    console.log('\n📋 INSTRUÇÕES PARA TESTE:')
    console.log('1. Abra uma aba com conta T.I. em /criar-aviso')
    console.log('2. Abra outra aba com conta usuário comum em /')
    console.log('3. Observe se este aviso aparece automaticamente nas duas abas')
    console.log('4. Verifique os logs do console do navegador (F12)')
    console.log('5. Aguarde até 8 segundos para o polling detectar')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCrossSession()