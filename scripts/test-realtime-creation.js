const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRealtimeCreation() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    console.log('🚀 Criando aviso para testar tempo real...')

    // Criar aviso para testar tempo real
    const notice = await prisma.notice.create({
      data: {
        title: `Teste Tempo Real - ${new Date().toLocaleTimeString('pt-BR')}`,
        content: 'Este aviso foi criado para testar se o sistema de tempo real detecta novos avisos corretamente.',
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

    console.log('✅ Aviso criado:', {
      id: notice.id,
      title: notice.title,
      createdAt: notice.createdAt.toLocaleString('pt-BR')
    })

    console.log('📢 Verifique se o aviso aparece automaticamente na interface!')
    console.log('🔍 Observe os logs do console do navegador para ver se o polling detecta a mudança')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRealtimeCreation()