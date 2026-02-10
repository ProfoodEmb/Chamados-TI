const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateKanbanStatus() {
  console.log('🔄 Iniciando migração de kanbanStatus...');

  try {
    // Buscar todos os tickets
    const tickets = await prisma.ticket.findMany({
      select: {
        id: true,
        number: true,
        status: true,
        kanbanStatus: true,
      },
    });

    console.log(`📊 Total de tickets: ${tickets.length}`);

    let updated = 0;

    for (const ticket of tickets) {
      // Mapear status para kanbanStatus
      let newKanbanStatus = ticket.kanbanStatus;

      // Se já tem kanbanStatus diferente de inbox, manter
      if (ticket.kanbanStatus !== 'inbox') {
        continue;
      }

      // Mapear baseado no status atual
      switch (ticket.status) {
        case 'Aberto':
          newKanbanStatus = 'inbox';
          break;
        case 'Pendente':
          newKanbanStatus = 'in_progress';
          break;
        case 'Aguardando Aprovação':
          newKanbanStatus = 'review';
          break;
        case 'Resolvido':
        case 'Fechado':
          newKanbanStatus = 'done';
          break;
        default:
          newKanbanStatus = 'inbox';
      }

      // Atualizar apenas se mudou
      if (newKanbanStatus !== ticket.kanbanStatus) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { kanbanStatus: newKanbanStatus },
        });
        console.log(`✅ Ticket #${ticket.number}: ${ticket.status} → ${newKanbanStatus}`);
        updated++;
      }
    }

    console.log(`\n✨ Migração concluída!`);
    console.log(`📈 Tickets atualizados: ${updated}`);
    console.log(`📊 Tickets sem alteração: ${tickets.length - updated}`);

    // Mostrar estatísticas
    const stats = await prisma.ticket.groupBy({
      by: ['kanbanStatus'],
      _count: true,
    });

    console.log('\n📊 Distribuição no Kanban:');
    stats.forEach((stat) => {
      console.log(`   ${stat.kanbanStatus}: ${stat._count} tickets`);
    });
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateKanbanStatus();
