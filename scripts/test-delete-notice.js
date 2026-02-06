const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDeleteNotice() {
  try {
    // Buscar o aviso Debug Test
    const notice = await prisma.notice.findFirst({
      where: { title: { contains: 'Debug Test' } },
      include: { author: true }
    });
    
    if (!notice) {
      console.log('❌ Aviso não encontrado');
      return;
    }
    
    console.log('📋 Aviso encontrado:');
    console.log('- ID:', notice.id);
    console.log('- Título:', notice.title);
    console.log('- Autor ID:', notice.authorId);
    console.log('- Autor:', notice.author?.name);
    console.log('- Role do autor:', notice.author?.role);
    
    // Buscar usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    console.log('👤 Usuário admin:', adminUser.name, '(ID:', adminUser.id, ')');
    
    // Verificar se o admin pode excluir
    const canDelete = adminUser.role === "admin" || adminUser.id === notice.authorId;
    console.log('🔐 Pode excluir?', canDelete ? '✅ Sim' : '❌ Não');
    
    if (canDelete) {
      console.log('🗑️ Tentando excluir...');
      
      // Excluir o aviso
      await prisma.notice.delete({
        where: { id: notice.id }
      });
      
      console.log('✅ Aviso excluído com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteNotice();