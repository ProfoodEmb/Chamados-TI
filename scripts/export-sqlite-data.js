const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')

const db = new sqlite3.Database('./prisma/dev.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar no SQLite:', err)
    process.exit(1)
  }
  console.log('✅ Conectado ao SQLite\n')
})

const data = {}

async function exportTable(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) {
        console.log(`⚠️  Tabela ${tableName} não existe ou está vazia`)
        resolve([])
      } else {
        console.log(`✅ ${tableName}: ${rows.length} registros`)
        resolve(rows)
      }
    })
  })
}

async function main() {
  console.log('📤 Exportando dados do SQLite...\n')

  data.users = await exportTable('User')
  data.accounts = await exportTable('Account')
  data.sessions = await exportTable('Session')
  data.tickets = await exportTable('Ticket')
  data.messages = await exportTable('Message')
  data.attachments = await exportTable('Attachment')
  data.notices = await exportTable('Notice')

  fs.writeFileSync('./sqlite-export.json', JSON.stringify(data, null, 2))
  
  console.log('\n✅ Dados exportados para sqlite-export.json')
  
  db.close()
}

main().catch(console.error)
