const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSimpleNotice() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    // Criar aviso simples sem programação (publicação imediata)
    const notice = await prisma.notice.create({
      data: {
        title: 'Teste - Publicação Imediata',
        content: 'Este aviso deve ser publicado imediatamente sem programação.',
        type: 'info',
        priority: 'medium',
        level: 'general',
        targetSectors: null,
        scheduledFor: null, // Sem programação = publicação imediata
        publishedAt: new Date(), // Publicado agora
        expiresAt: null, // Sem expiração
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

    console.log('✅ Aviso criado com sucesso:', {
      id: notice.id,
      title: notice.title,
      publishedAt: notice.publishedAt?.toLocaleString('pt-BR'),
      scheduledFor: notice.scheduledFor,
      expiresAt: notice.expiresAt
    })

    console.log('📢 Teste a criação pela interface agora!')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSimpleNotice()