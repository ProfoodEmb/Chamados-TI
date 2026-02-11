const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestTickets() {
  try {
    // Buscar usuários
    const users = await prisma.user.findMany();
    const adminUser = users.find(u => u.role === 'admin');
    const infraUser = users.find(u => u.role === 'lider_infra');
    const sistemasUser = users.find(u => u.role === 'lider_sistemas');
    
    if (!adminUser || !infraUser || !sistemasUser) {
      console.log('❌ Usuários necessários não encontrados');
      return;
    }

    // Tickets de teste com diferentes características
    const testTickets = [
      {
        subject: 'Problema na impressora HP LaserJet',
        description: 'Impressora não está funcionando no setor financeiro',
        category: 'Hardware',
        urgency: 'high',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: infraUser.id,
        kanbanStatus: 'inbox'
      },
      {
        subject: 'Sistema ERP lento',
        description: 'O sistema está muito lento para processar pedidos',
        category: 'Software',
        urgency: 'critical',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: sistemasUser.id,
        kanbanStatus: 'in_progress'
      },
      {
        subject: 'Configurar backup automático',
        description: 'Implementar rotina de backup para servidor de arquivos',
        category: 'Sistema',
        urgency: 'medium',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: null,
        kanbanStatus: 'inbox'
      },
      {
        subject: 'Problema de rede no andar 2',
        description: 'Computadores sem acesso à internet',
        category: 'Rede',
        urgency: 'high',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: infraUser.id,
        kanbanStatus: 'review'
      },
      {
        subject: 'Atualização do sistema de vendas',
        description: 'Aplicar nova versão do sistema de vendas',
        category: 'Software',
        urgency: 'low',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: null,
        kanbanStatus: 'inbox'
      },
      {
        subject: 'Configurar email corporativo',
        description: 'Configurar conta de email para novo funcionário',
        category: 'Email',
        urgency: 'medium',
        team: 'sistemas',
        requesterId: adminUser.id,
        assignedToId: sistemasUser.id,
        kanbanStatus: 'done'
      }
    ];

    console.log('🎫 Criando tickets de teste...');
    
    for (const ticketData of testTickets) {
      // Gerar número único
      const count = await prisma.ticket.count();
      const number = `TI${String(count + 1).padStart(6, '0')}`;
      
      const ticket = await prisma.ticket.create({
        data: {
          ...ticketData,
          number,
          status: 'Aberto'
        }
      });
      
      console.log(`✅ Ticket criado: ${ticket.number} - ${ticket.subject}`);
    }
    
    console.log('🎉 Todos os tickets de teste foram criados!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTickets();