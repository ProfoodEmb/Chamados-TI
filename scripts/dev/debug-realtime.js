const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugRealtime() {
  try {
    console.log('🔍 DEBUG - Verificando sistema de tempo real')
    console.log('=' .repeat(50))
    
    // 1. Verificar quantos avisos existem no banco
    const allNotices = await prisma.notice.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Total de avisos no banco: ${allNotices.length}`)
    
    if (allNotices.length > 0) {
      console.log('\n📋 Últimos 3 avisos:')
      allNotices.slice(0, 3).forEach((notice, index) => {
        console.log(`   ${index + 1}. ${notice.title}`)
        console.log(`      ID: ${notice.id}`)
        console.log(`      Ativo: ${notice.active}`)
        console.log(`      Criado: ${notice.createdAt.toLocaleString('pt-BR')}`)
        console.log(`      Autor: ${notice.author.name}`)
        console.log('')
      })
    }
    
    // 2. Verificar avisos ativos (mesma lógica da API)
    const now = new Date()
    const activeNotices = await prisma.notice.findMany({
      where: { 
        active: true,
        AND: [
          {
            OR: [
              { scheduledFor: null },
              { scheduledFor: { lte: now } }
            ]
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`📊 Avisos ativos (que a API retorna): ${activeNotices.length}`)
    
    if (activeNotices.length > 0) {
      console.log('\n📋 Avisos ativos:')
      activeNotices.forEach((notice, index) => {
        console.log(`   ${index + 1}. ${notice.title}`)
        console.log(`      ID: ${notice.id}`)
        console.log(`      Programado: ${notice.scheduledFor ? notice.scheduledFor.toLocaleString('pt-BR') : 'Não'}`)
        console.log(`      Expira: ${notice.expiresAt ? notice.expiresAt.toLocaleString('pt-BR') : 'Não'}`)
        console.log('')
      })
    }
    
    // 3. Criar um aviso de teste
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (adminUser) {
      const testNotice = await prisma.notice.create({
        data: {
          title: `🔧 Debug Test - ${new Date().toLocaleTimeString('pt-BR')}`,
          content: 'Aviso criado para debug do sistema de tempo real.',
          type: 'info',
          priority: 'medium',
          level: 'general',
          targetSectors: null,
          scheduledFor: null,
          publishedAt: new Date(),
          expiresAt: null,
          active: true,
          authorId: adminUser.id
        }
      })
      
      console.log('✅ Aviso de teste criado:')
      console.log(`   ID: ${testNotice.id}`)
      console.log(`   Título: ${testNotice.title}`)
      console.log(`   Criado: ${testNotice.createdAt.toLocaleString('pt-BR')}`)
      
      console.log('\n🔍 INSTRUÇÕES PARA DEBUG:')
      console.log('1. Abra o console do navegador (F12)')
      console.log('2. Vá para a aba Network')
      console.log('3. Filtre por "notices"')
      console.log('4. Observe se as requisições GET /api/notices estão acontecendo')
      console.log('5. Verifique se este novo aviso aparece nas respostas')
      console.log('6. Observe os logs do console JavaScript')
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugRealtime()