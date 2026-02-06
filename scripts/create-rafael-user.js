const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRafaelUser() {
  try {
    // Verificar se Rafael já existe
    const existingRafael = await prisma.user.findFirst({
      where: { name: { contains: 'Rafael' } }
    });

    if (existingRafael) {
      console.log('✅ Rafael já existe:', existingRafael.name);
      return;
    }

    // Criar usuário Rafael
    const rafael = await prisma.user.create({
      data: {
        name: 'Rafael Silva',
        email: 'rafael@empresa.com',
        username: 'rafael.silva',
        role: 'func_sistemas',
        team: 'sistemas',
        setor: 'TI',
        empresa: 'profood',
        status: 'ativo'
      }
    });

    console.log('✅ Usuário Rafael criado:', rafael.name);
    console.log('- ID:', rafael.id);
    console.log('- Role:', rafael.role);
    console.log('- Team:', rafael.team);

  } catch (error) {
    console.error('❌ Erro ao criar Rafael:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRafaelUser();