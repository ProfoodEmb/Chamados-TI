const { PrismaClient } = require('@prisma/client')

// Cliente para SQLite
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

// Cliente para PostgreSQL
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrate() {
  console.log('🔄 Iniciando migração do SQLite para PostgreSQL...\n')

  try {
    // 1. Migrar Usuários
    console.log('👥 Migrando usuários...')
    const users = await sqliteClient.user.findMany()
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log(`✅ ${users.length} usuários migrados\n`)

    // 2. Migrar Accounts
    console.log('🔐 Migrando contas de autenticação...')
    const accounts = await sqliteClient.account.findMany()
    for (const account of accounts) {
      await postgresClient.account.upsert({
        where: { id: account.id },
        update: account,
        create: account
      })
    }
    console.log(`✅ ${accounts.length} contas migradas\n`)

    // 3. Migrar Sessions
    console.log('🎫 Migrando sessões...')
    const sessions = await sqliteClient.session.findMany()
    for (const session of sessions) {
      await postgresClient.session.upsert({
        where: { id: session.id },
        update: session,
        create: session
      })
    }
    console.log(`✅ ${sessions.length} sessões migradas\n`)

    // 4. Migrar Tickets
    console.log('🎟️  Migrando chamados...')
    const tickets = await sqliteClient.ticket.findMany()
    for (const ticket of tickets) {
      await postgresClient.ticket.upsert({
        where: { id: ticket.id },
        update: ticket,
        create: ticket
      })
    }
    console.log(`✅ ${tickets.length} chamados migrados\n`)

    // 5. Migrar Messages
    console.log('💬 Migrando mensagens...')
    const messages = await sqliteClient.message.findMany()
    for (const message of messages) {
      await postgresClient.message.upsert({
        where: { id: message.id },
        update: message,
        create: message
      })
    }
    console.log(`✅ ${messages.length} mensagens migradas\n`)

    // 6. Migrar Attachments
    console.log('📎 Migrando anexos...')
    const attachments = await sqliteClient.attachment.findMany()
    for (const attachment of attachments) {
      await postgresClient.attachment.upsert({
        where: { id: attachment.id },
        update: attachment,
        create: attachment
      })
    }
    console.log(`✅ ${attachments.length} anexos migrados\n`)

    // 7. Migrar Notices
    console.log('📢 Migrando avisos...')
    const notices = await sqliteClient.notice.findMany()
    for (const notice of notices) {
      await postgresClient.notice.upsert({
        where: { id: notice.id },
        update: notice,
        create: notice
      })
    }
    console.log(`✅ ${notices.length} avisos migrados\n`)

    console.log('🎉 Migração concluída com sucesso!')
    console.log('\n📊 Resumo:')
    console.log(`   - ${users.length} usuários`)
    console.log(`   - ${accounts.length} contas`)
    console.log(`   - ${sessions.length} sessões`)
    console.log(`   - ${tickets.length} chamados`)
    console.log(`   - ${messages.length} mensagens`)
    console.log(`   - ${attachments.length} anexos`)
    console.log(`   - ${notices.length} avisos`)

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    throw error
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

migrate()
  .catch((e) => {
    console.error('❌ Falha na migração:', e)
    process.exit(1)
  })
