const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTicketsForJacksonAndGustavo() {
  try {
    // Buscar usuários
    const users = await prisma.user.findMany();
    const adminUser = users.find(u => u.role === 'admin');
    const jacksonUser = users.find(u => u.name.toLowerCase().includes('jackson'));
    const gustavoUser = users.find(u => u.name.toLowerCase().includes('gustavo'));
    
    if (!adminUser || !jacksonUser || !gustavoUser) {
      console.log('❌ Usuários necessários não encontrados');
      console.log('Admin:', !!adminUser);
      console.log('Jackson:', !!jacksonUser);
      console.log('Gustavo:', !!gustavoUser);
      return;
    }

    console.log('👤 Jackson ID:', jacksonUser.id, '- Nome:', jacksonUser.name);
    console.log('👤 Gustavo ID:', gustavoUser.id, '- Nome:', gustavoUser.name);

    // Tickets para Jackson
    const jacksonTickets = [
      {
        subject: 'Configurar servidor de backup',
        description: 'Implementar rotina de backup automático no servidor principal',
        category: 'Sistema',
        urgency: 'high',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: jacksonUser.id,
        kanbanStatus: 'in_progress'
      },
      {
        subject: 'Manutenção preventiva switches',
        description: 'Realizar manutenção preventiva nos switches da rede',
        category: 'Rede',
        urgency: 'medium',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: jacksonUser.id,
        kanbanStatus: 'inbox'
      }
    ];

    // Tickets para Gustavo
    const gustavoTickets = [
      {
        subject: 'Trocar HD do servidor de arquivos',
        description: 'Substituir HD com defeito no servidor de arquivos',
        category: 'Hardware',
        urgency: 'critical',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: gustavoUser.id,
        kanbanStatus: 'review'
      },
      {
        subject: 'Instalar impressora no RH',
        description: 'Configurar nova impressora multifuncional no setor de RH',
        category: 'Hardware',
        urgency: 'low',
        team: 'infra',
        requesterId: adminUser.id,
        assignedToId: gustavoUser.id,
        kanbanStatus: 'done'
      }
    ];

    console.log('🎫 Criando tickets para Jackson...');
    
    for (const ticketData of jacksonTickets) {
      const count = await prisma.ticket.count();
      const number = `TI${String(count + 1).padStart(6, '0')}`;
      
      const ticket = await prisma.ticket.create({
        data: {
          ...ticketData,
          number,
          status: 'Aberto'
        }
      });
      
      console.log(`✅ Ticket criado para Jackson: ${ticket.number} - ${ticket.subject}`);
    }

    console.log('🎫 Criando tickets para Gustavo...');
    
    for (const ticketData of gustavoTickets) {
      const count = await prisma.ticket.count();
      const number = `TI${String(count + 1).padStart(6, '0')}`;
      
      const ticket = await prisma.ticket.create({
        data: {
          ...ticketData,
          number,
          status: 'Aberto'
        }
      });
      
      console.log(`✅ Ticket criado para Gustavo: ${ticket.number} - ${ticket.subject}`);
    }
    
    console.log('🎉 Todos os tickets foram criados!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTicketsForJacksonAndGustavo();