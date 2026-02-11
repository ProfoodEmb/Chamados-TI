// Script para testar criação de chamado com notificação WhatsApp
// Simula uma requisição real à API de criação de tickets

const TEST_CONFIG = {
  apiUrl: 'http://localhost:3000/api/tickets',
  testData: {
    subject: 'Teste de Notificação WhatsApp - Infraestrutura',
    description: 'Este é um teste para verificar se as notificações WhatsApp estão funcionando quando um chamado é criado através da API.',
    category: 'Suporte',
    urgency: 'high',
    team: 'infra',
    service: null,
    anydesk: null
  }
}

async function testTicketCreation() {
  console.log('🧪 Testando criação de chamado com notificação WhatsApp...\n')
  
  try {
    console.log('📋 Dados do chamado:')
    console.log(JSON.stringify(TEST_CONFIG.testData, null, 2))
    console.log('\n📡 Enviando requisição para:', TEST_CONFIG.apiUrl)
    
    const response = await fetch(TEST_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nota: Em produção, você precisaria de um token de autenticação válido
        // Este teste assume que você está logado no navegador
      },
      body: JSON.stringify(TEST_CONFIG.testData)
    })
    
    console.log('\n📊 Status da resposta:', response.status, response.statusText)
    
    if (response.ok) {
      const ticket = await response.json()
      console.log('\n✅ Chamado criado com sucesso!')
      console.log('📋 Número do chamado:', ticket.number)
      console.log('👤 Solicitante:', ticket.requester?.name)
      console.log('🏷️  Equipe:', ticket.team)
      console.log('\n📱 Verifique se a notificação WhatsApp foi enviada para: 5545999363214')
      console.log('\n💡 Dica: Verifique os logs do servidor para ver o status do envio WhatsApp')
    } else {
      const error = await response.text()
      console.error('\n❌ Erro ao criar chamado:', error)
      
      if (response.status === 401) {
        console.log('\n⚠️  Erro de autenticação!')
        console.log('💡 Este script precisa ser executado com autenticação.')
        console.log('💡 Alternativa: Crie um chamado manualmente pelo sistema e verifique os logs.')
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:', error.message)
    console.log('\n💡 Certifique-se de que:')
    console.log('   1. O servidor está rodando (npm run dev)')
    console.log('   2. Você está autenticado no sistema')
    console.log('   3. As variáveis de ambiente estão configuradas')
  }
}

// Executar teste
testTicketCreation()
