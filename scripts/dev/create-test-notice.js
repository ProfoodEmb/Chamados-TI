const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestNotice() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    // Criar aviso de teste
    const notice = await prisma.notice.create({
      data: {
        title: 'Teste de Tempo Real - Avisos',
        content: 'Este é um aviso de teste para verificar se o sistema de tempo real está funcionando corretamente. Você deve ver este aviso aparecer automaticamente em todas as páginas.',
        type: 'info',
        priority: 'medium',
        level: 'general',
        targetSectors: null, // Para todos os setores
        scheduledFor: null, // Publicar imediatamente
        publishedAt: new Date(),
        expiresAt: null, // Não expira
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

    console.log('✅ Aviso de teste criado:', {
      id: notice.id,
      title: notice.title,
      author: notice.author.name
    })

    console.log('📢 Agora verifique se o aviso aparece automaticamente nas páginas!')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotice()