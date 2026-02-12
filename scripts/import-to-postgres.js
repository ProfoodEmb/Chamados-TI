const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  console.log('📥 Importando dados para PostgreSQL...\n')

  const data = JSON.parse(fs.readFileSync('./sqlite-export.json', 'utf8'))

  // Função para converter dados do SQLite para PostgreSQL
  const convertUser = (user) => ({
    ...user,
    emailVerified: Boolean(user.emailVerified),
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  })

  const convertAccount = (account) => ({
    ...account,
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
    accessTokenExpiresAt: account.accessTokenExpiresAt ? new Date(account.accessTokenExpiresAt) : null,
    refreshTokenExpiresAt: account.refreshTokenExpiresAt ? new Date(account.refreshTokenExpiresAt) : null,
  })

  const convertSession = (session) => ({
    ...session,
    expiresAt: new Date(session.expiresAt),
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
  })

  const convertTicket = (ticket) => ({
    ...ticket,
    createdAt: new Date(ticket.createdAt),
    updatedAt: new Date(ticket.updatedAt),
  })

  const convertMessage = (message) => ({
    ...message,
    createdAt: new Date(message.createdAt),
  })

  const convertAttachment = (attachment) => ({
    ...attachment,
    createdAt: new Date(attachment.createdAt),
  })

  const convertNotice = (notice) => ({
    ...notice,
    active: Boolean(notice.active),
    scheduledFor: notice.scheduledFor ? new Date(notice.scheduledFor) : null,
    publishedAt: notice.publishedAt ? new Date(notice.publishedAt) : null,
    expiresAt: notice.expiresAt ? new Date(notice.expiresAt) : null,
    createdAt: new Date(notice.createdAt),
    updatedAt: new Date(notice.updatedAt),
  })

  try {
    // 1. Importar Usuários
    console.log('👥 Importando usuários...')
    for (const user of data.users) {
      const converted = convertUser(user)
      await prisma.user.upsert({
        where: { id: converted.id },
        update: converted,
        create: converted
      })
    }
    console.log(`✅ ${data.users.length} usuários importados\n`)

    // 2. Importar Accounts
    console.log('🔐 Importando contas...')
    for (const account of data.accounts) {
      const converted = convertAccount(account)
      await prisma.account.upsert({
        where: { id: converted.id },
        update: converted,
        create: converted
      })
    }
    console.log(`✅ ${data.accounts.length} contas importadas\n`)

    // 3. Importar Sessions
    console.log('🎫 Importando sessões...')
    for (const session of data.sessions) {
      const converted = convertSession(session)
      await prisma.session.upsert({
        where: { id: converted.id },
        update: converted,
        create: converted
      })
    }
    console.log(`✅ ${data.sessions.length} sessões importadas\n`)

    // 4. Importar Tickets
    console.log('🎟️  Importando chamados...')
    for (const ticket of data.tickets) {
      const converted = convertTicket(ticket)
      await prisma.ticket.upsert({
        where: { id: converted.id },
        update: converted,
        create: converted
      })
    }
    console.log(`✅ ${data.tickets.length} chamados importados\n`)

    // 5. Importar Messages
    console.log('💬 Importando mensagens...')
    for (const message of data.messages) {
      const converted = convertMessage(message)
      await prisma.message.upsert({
        where: { id: converted.id },
        update: converted,
        create: converted
      })
    }
    console.log(`✅ ${data.messages.length} mensagens importadas\n`)

    // 6. Importar Attachments (se houver)
    if (data.attachments && data.attachments.length > 0) {
      console.log('📎 Importando anexos...')
      for (const attachment of data.attachments) {
        const converted = convertAttachment(attachment)
        await prisma.attachment.upsert({
          where: { id: converted.id },
          update: converted,
          create: converted
        })
      }
      console.log(`✅ ${data.attachments.length} anexos importados\n`)
    }

    // 7. Importar Notices (se houver)
    if (data.notices && data.notices.length > 0) {
      console.log('📢 Importando avisos...')
      for (const notice of data.notices) {
        const converted = convertNotice(notice)
        await prisma.notice.upsert({
          where: { id: converted.id },
          update: converted,
          create: converted
        })
      }
      console.log(`✅ ${data.notices.length} avisos importados\n`)
    }

    console.log('🎉 Importação concluída com sucesso!')

  } catch (error) {
    console.error('❌ Erro durante a importação:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Falha na importação:', e)
    process.exit(1)
  })
