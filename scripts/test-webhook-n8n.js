// Script para testar o webhook do n8n

const WEBHOOK_URL = 'https://n8n.profood.com.br/webhook/9c5f790a-3833-49fd-9499-89354c3d80f3'

async function testWebhook() {
  console.log('🧪 Testando webhook do n8n...\n')
  console.log('📍 URL:', WEBHOOK_URL)
  console.log('')

  const testTicket = {
    event: 'ticket_created',
    timestamp: new Date().toISOString(),
    ticket: {
      id: 'test-123',
      number: '000999',
      subject: 'Teste de Webhook - Sistema de Chamados',
      description: 'Este é um ticket de teste para verificar se o webhook do n8n está funcionando corretamente.',
      category: 'Teste',
      urgency: 'high',
      urgencyLabel: '🟠 Alta',
      status: 'Aberto',
      team: 'sistemas',
      teamLabel: 'Sistemas',
      service: 'Sistema de Testes',
      createdAt: new Date().toISOString(),
      requester: {
        id: 'user-test',
        name: 'Jackson Felipe',
        email: 'jackson@profood.com.br',
        setor: 'TI',
        empresa: 'profood'
      },
      assignedTo: {
        id: 'assigned-test',
        name: 'Rafael Silva',
        email: 'rafael@profood.com.br'
      }
    }
  }

  console.log('📦 Payload que será enviado:')
  console.log(JSON.stringify(testTicket, null, 2))
  console.log('')

  try {
    console.log('📤 Enviando requisição...')
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTicket)
    })

    console.log('📊 Status da resposta:', response.status, response.statusText)

    if (response.ok) {
      const responseData = await response.text()
      console.log('📥 Resposta do servidor:')
      console.log(responseData)
      console.log('')
      console.log('✅ WEBHOOK FUNCIONANDO CORRETAMENTE!')
      console.log('🎉 O n8n deve ter recebido a notificação!')
    } else {
      const errorText = await response.text()
      console.log('❌ Erro na resposta:')
      console.log(errorText)
      console.log('')
      console.log('⚠️  Webhook retornou erro. Verifique a configuração no n8n.')
    }

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error)
    console.log('')
    console.log('⚠️  Não foi possível conectar ao webhook. Verifique:')
    console.log('   1. A URL está correta?')
    console.log('   2. O n8n está rodando?')
    console.log('   3. Há conexão com a internet?')
  }
}

testWebhook()
