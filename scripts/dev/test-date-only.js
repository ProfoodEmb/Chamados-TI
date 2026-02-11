const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDateOnly() {
  try {
    // Buscar um usuário admin para ser o autor
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado')
      return
    }

    // Criar aviso com data programada (apenas data, sem horário)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Início do dia

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(23, 59, 59, 999) // Final do dia

    const notice = await prisma.notice.create({
      data: {
        title: 'Teste - Apenas Data (dd/mm/aaaa)',
        content: 'Este aviso testa se as datas estão funcionando apenas com dd/mm/aaaa (sem horário).',
        type: 'info',
        priority: 'medium',
        level: 'general',
        targetSectors: null,
        scheduledFor: tomorrow, // Programado para amanhã
        publishedAt: null,
        expiresAt: nextWeek, // Expira na próxima semana
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
      scheduledFor: notice.scheduledFor?.toLocaleDateString('pt-BR'),
      expiresAt: notice.expiresAt?.toLocaleDateString('pt-BR')
    })

    console.log('📅 Agora teste criar um aviso pela interface usando apenas datas!')
    
  } catch (error) {
    console.error('❌ Erro ao criar aviso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDateOnly()