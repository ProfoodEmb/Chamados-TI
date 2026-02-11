const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTicketsForAllResponsaveis() {
  try {
    // Buscar usuários
    const users = await prisma.user.findMany();
    const adminUser = users.find(u => u.role === 'admin');
    const danilo = users.find(u => u.name.toLowerCase().includes('danilo'));
    const antony = users.find(u => u.name.toLowerCase().includes('antony'));
    const rafael = users.find(u => u.name.toLowerCase().includes('rafael'));
    
    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    console.log('👤 Usuários encontrados:');
    console.log('- Danilo:', danilo?.name || 'Não encontrado');
    console.log('- Antony:', antony?.name || 'Não encontrado');
    console.log('- Rafael:', rafael?.name || 'Não encontrado');

    const ticketsData = [];

    // Tickets para Danilo
    if (danilo) {
      ticketsData.push({
        subject: 'Atualizar sistema de vendas',
        description: 'Aplicar patch de segurança no sistema de vendas',
        category: 'Software',
        urgency: 'high',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: danilo.id,
        kanbanStatus: 'in_progress'
      });
    }

    // Tickets para Antony
    if (antony) {
      ticketsData.push({
        subject: 'Configurar novo ERP',
        description: 'Implementar módulo financeiro no novo ERP',
        category: 'Sistema',
        urgency: 'medium',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: antony.id,
        kanbanStatus: 'review'
      });
    }

    // Tickets para Rafael
    if (rafael) {
      ticketsData.push({
        subject: 'Migração de banco de dados',
        description: 'Migrar dados do sistema legado para nova plataforma',
        category: 'Sistema',
        urgency: 'critical',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: rafael.id,
        kanbanStatus: 'inbox'
      });
    }

    console.log('🎫 Criando tickets...');
    
    for (const ticketData of ticketsData) {
      const count = await prisma.ticket.count();
      const number = `TI${String(count + 1).padStart(6, '0')}`;
      
      const ticket = await prisma.ticket.create({
        data: {
          ...ticketData,
          number,
          status: 'Aberto'
        }
      });
      
      const assignedUser = users.find(u => u.id === ticketData.assignedToId);
      console.log(`✅ Ticket criado: ${ticket.number} - ${ticket.subject} (${assignedUser?.name})`);
    }
    
    console.log('🎉 Todos os tickets foram criados!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTicketsForAllResponsaveis();