import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários
  const users = [
    {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: 'Administrador Geral',
      email: 'admin@empresa.com',
      role: 'admin',
      team: 'admin',
    },
    {
      username: 'lider_infra',
      password: await bcrypt.hash('lider123', 10),
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'lider_infra',
      team: 'infra',
    },
    {
      username: 'func_infra',
      password: await bcrypt.hash('func123', 10),
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      role: 'func_infra',
      team: 'infra',
    },
    {
      username: 'lider_sistemas',
      password: await bcrypt.hash('lider123', 10),
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      role: 'lider_sistemas',
      team: 'sistemas',
    },
    {
      username: 'func_sistemas',
      password: await bcrypt.hash('func123', 10),
      name: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.com',
      role: 'func_sistemas',
      team: 'sistemas',
    },
    {
      username: 'usuario',
      password: await bcrypt.hash('usuario123', 10),
      name: 'Jackson Felipe',
      email: 'jackson.felipe@empresa.com',
      role: 'user',
      team: 'user',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    })
    console.log(`✅ Usuário criado: ${user.username}`)
  }

  console.log('✨ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
