const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNoticeCreation() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    // Criar aviso simples sem programação (deve funcionar)
    const notice = await prisma.notice.create({
      data: {
        title: 'Teste - Criação Simples',
        content: 'Este aviso testa se a criação sem programação funciona corretamente.',
        type: 'info',
        priority: 'medium',
        level: 'general',
        targetSectors: null,
        scheduledFor: null, // Sem programação
        publishedAt: new Date(),
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
      scheduledFor: notice.scheduledFor,
      expiresAt: notice.expiresAt
    })

    console.log('📢 Agora teste criar um aviso pela interface sem preencher as datas!')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNoticeCreation()