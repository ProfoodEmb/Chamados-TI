// Script para testar notificação de chamado de infraestrutura
// Usage: node scripts/dev/test-infra-notification.js

const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  
  lines.forEach((line) => {
    if (line.trim().startsWith('#') || !line.trim()) return
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      value = value.replace(/^["'](.*)["']$/, '$1')
      process.env[key] = value
    }
  })
}

loadEnv()

const testInfraNotification = async () => {
  try {
    console.log('🧪 Testando notificação de chamado de Infraestrutura...\n')

    const apiUrl = process.env.EVOLUTION_API_URL
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME
    const apiKey = process.env.EVOLUTION_API_KEY
    const infraPhone = process.env.INFRA_TEAM_PHONE

    console.log('📋 Configuração:')
    console.log(`   API URL: ${apiUrl ? '✅' : '❌'}`)
    console.log(`   Instância: ${instanceName ? '✅' : '❌'}`)
    console.log(`   API Key: ${apiKey ? '✅' : '❌'}`)
    console.log(`   Telefone Infra: ${infraPhone || '❌ NÃO CONFIGURADO'}\n`)

    if (!apiUrl || !instanceName || !apiKey || !infraPhone) {
      console.error('❌ Configuração incompleta!')
      process.exit(1)
    }

    // Simular um chamado de infraestrutura
    const mockTicket = {
      number: '000123',
      subject: 'Impressora não está funcionando',
      description: 'A impressora do setor financeiro parou de imprimir. Já tentei reiniciar mas não resolveu.',
      category: 'Impressora',
      urgency: 'high',
      team: 'infra',
      service: null,
      requester: {
        name: 'Maria Santos',
        email: 'maria@profood.com.br'
      },
      assignedTo: {
        name: 'Jackson Felipe'
      }
    }

    const urgencyEmojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    }

    const urgencyLabels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica'
    }

    const urgencyEmoji = urgencyEmojis[mockTicket.urgency] || '⚪'
    const urgencyLabel = urgencyLabels[mockTicket.urgency] || mockTicket.urgency

    const message = `🔔 *Novo Chamado - Infraestrutura*

📋 *Número:* #${mockTicket.number}
📝 *Assunto:* ${mockTicket.subject}
${urgencyEmoji} *Urgência:* ${urgencyLabel}
📁 *Categoria:* ${mockTicket.category}

👤 *Solicitante:* ${mockTicket.requester.name}
📧 *Email:* ${mockTicket.requester.email}

📄 *Descrição:*
${mockTicket.description}

👨‍💼 *Atribuído para:* ${mockTicket.assignedTo.name}

_Acesse o sistema para mais detalhes._`

    console.log('📱 Enviando notificação para equipe de Infraestrutura...')
    console.log(`📞 Número: ${infraPhone}`)
    console.log('⏳ Aguarde...\n')

    const url = `${apiUrl}/message/sendText/${instanceName}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: infraPhone.replace(/\D/g, ''),
        text: message
      })
    })

    console.log(`📊 Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const result = await response.json()
      console.log('\n✅ Notificação enviada com sucesso!')
      console.log('📋 Resposta da API:')
      console.log(JSON.stringify(result, null, 2))
      console.log('\n💡 Verifique o WhatsApp para confirmar o recebimento.')
      console.log('\n📝 Mensagem enviada:')
      console.log('─'.repeat(50))
      console.log(message)
      console.log('─'.repeat(50))
    } else {
      const errorText = await response.text()
      console.error('\n❌ Erro ao enviar notificação!')
      console.error('📋 Resposta da API:')
      console.error(errorText)
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:', error.message)
  }
}

testInfraNotification()
