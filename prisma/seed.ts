import { prisma } from '../lib/prisma'
import { auth } from '../lib/auth'

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuários com Better Auth
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      name: 'Vinicius Mathues',
      email: 'admin@empresa.com',
      role: 'admin',
      team: 'admin',
      setor: 'ti',
      empresa: 'profood',
    },
    {
      username: 'lider_infra',
      password: 'lider123',
      name: 'Jackson Felipe',
      email: 'lider_infra@empresa.com',
      role: 'lider_infra',
      team: 'infra',
      setor: 'ti',
      empresa: 'profood',
    },
    {
      username: 'func_infra',
      password: 'func1234',
      name: 'Gustavo Americano',
      email: 'func_infra@empresa.com',
      role: 'func_infra',
      team: 'infra',
      setor: 'ti',
      empresa: 'profood',
    },
    {
      username: 'lider_sistemas',
      password: 'lider123',
      name: 'Antony Gouvea',
      email: 'lider_sistemas@empresa.com',
      role: 'lider_sistemas',
      team: 'sistemas',
      setor: 'ti',
      empresa: 'tuicial',
    },
    {
      username: 'func_sistemas',
      password: 'func1234',
      name: 'Danilo Oliveira',
      email: 'func_sistemas@empresa.com',
      role: 'func_sistemas',
      team: 'sistemas',
      setor: 'ti',
      empresa: 'tuicial',
    },
    {
      username: 'usuario',
      password: 'usuario123',
      name: 'Usuário Comum',
      email: 'usuario@empresa.com',
      role: 'user',
      team: 'user',
      setor: 'vendas',
      empresa: 'profood',
    },
  ]

  for (const userData of users) {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log(`⏭️  Usuário já existe: ${userData.username}`)
      continue
    }

    // Criar usuário usando Better Auth API
    try {
      await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          username: userData.username,
          role: userData.role,
          team: userData.team,
          setor: userData.setor,
          empresa: userData.empresa,
          status: 'ativo', // Status padrão
        }
      })
      console.log(`✅ Usuário criado: ${userData.username}`)
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${userData.username}:`, error)
    }
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
