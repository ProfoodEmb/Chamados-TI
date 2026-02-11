const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllTickets() {
  console.log('🗑️  Iniciando exclusão de todos os tickets...');

  try {
    // Deletar em ordem devido às relações
    console.log('📝 Deletando attachments...');
    const attachments = await prisma.attachment.deleteMany({});
    console.log(`   ✅ ${attachments.count} attachments deletados`);

    console.log('💬 Deletando messages...');
    const messages = await prisma.message.deleteMany({});
    console.log(`   ✅ ${messages.count} messages deletadas`);

    console.log('🎫 Deletando tickets...');
    const tickets = await prisma.ticket.deleteMany({});
    console.log(`   ✅ ${tickets.count} tickets deletados`);

    console.log('\n✨ Todos os tickets foram deletados com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Tickets: ${tickets.count}`);
    console.log(`   - Mensagens: ${messages.count}`);
    console.log(`   - Anexos: ${attachments.count}`);
    console.log('\n🎯 Sistema pronto para começar do zero!');

  } catch (error) {
    console.error('❌ Erro ao deletar tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllTickets();
