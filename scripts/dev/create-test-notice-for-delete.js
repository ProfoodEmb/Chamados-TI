const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNotice() {
  try {
    // Buscar usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    // Criar aviso de teste
    const notice = await prisma.notice.create({
      data: {
        title: '🗑️ Teste de Exclusão - ' + new Date().toLocaleTimeString(),
        content: 'Este aviso foi criado para testar a funcionalidade de exclusão.',
        type: 'info',
        priority: 'low',
        level: 'general',
        active: true,
        authorId: adminUser.id
      }
    });
    
    console.log('✅ Aviso de teste criado:');
    console.log('- ID:', notice.id);
    console.log('- Título:', notice.title);
    console.log('- Autor:', adminUser.name);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotice();