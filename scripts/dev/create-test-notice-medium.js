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

    // Criar aviso de teste com prioridade média (não crítica)
    const notice = await prisma.notice.create({
      data: {
        title: 'Teste - Sem Prioridade Crítica',
        content: 'Este aviso testa se a prioridade crítica foi removida e se há apenas um botão X para fechar.',
        type: 'warning',
        priority: 'medium', // Usando média ao invés de crítica
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

    console.log('✅ Aviso de teste criado:', {
      id: notice.id,
      title: notice.title,
      priority: notice.priority,
      author: notice.author.name
    })

    console.log('📢 Verifique se:')
    console.log('1. Há apenas UM botão X no modal de criar aviso')
    console.log('2. A opção "Crítica" não aparece nas prioridades')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotice()