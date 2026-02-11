// Script de diagnóstico para verificar configuração WhatsApp
// Configuração manual (copie do seu .env)
const CONFIG = {
  EVOLUTION_API_URL: 'https://evolution-apiv223-production-bf63.up.railway.app',
  EVOLUTION_INSTANCE_NAME: 'jackson',
  EVOLUTION_API_KEY: 'FF2004F46318-4CB3-8B09-B27FFC20F4D1',
  INFRA_TEAM_PHONE: '5545999363214'
}

console.log('🔍 Diagnóstico da Configuração WhatsApp\n')
console.log('=' .repeat(60))

// 1. Verificar variáveis de ambiente
console.log('\n📋 1. Variáveis de Ambiente:')
console.log('   EVOLUTION_API_URL:', CONFIG.EVOLUTION_API_URL ? '✅ Configurada' : '❌ Faltando')
console.log('   EVOLUTION_INSTANCE_NAME:', CONFIG.EVOLUTION_INSTANCE_NAME ? '✅ Configurada' : '❌ Faltando')
console.log('   EVOLUTION_API_KEY:', CONFIG.EVOLUTION_API_KEY ? '✅ Configurada' : '❌ Faltando')
console.log('   INFRA_TEAM_PHONE:', CONFIG.INFRA_TEAM_PHONE ? '✅ Configurada' : '❌ Faltando')

// 2. Mostrar valores (parcialmente ocultos por segurança)
console.log('\n📝 2. Valores Configurados:')
if (CONFIG.EVOLUTION_API_URL) {
  console.log('   URL:', CONFIG.EVOLUTION_API_URL)
}
if (CONFIG.EVOLUTION_INSTANCE_NAME) {
  console.log('   Instância:', CONFIG.EVOLUTION_INSTANCE_NAME)
}
if (CONFIG.EVOLUTION_API_KEY) {
  const key = CONFIG.EVOLUTION_API_KEY
  console.log('   API Key:', key.substring(0, 8) + '...' + key.substring(key.length - 4))
}
if (CONFIG.INFRA_TEAM_PHONE) {
  console.log('   Telefone Infra:', CONFIG.INFRA_TEAM_PHONE)
}

// 3. Testar conexão com Evolution API
console.log('\n🔌 3. Testando Conexão com Evolution API...')

async function testConnection() {
  try {
    const url = `${CONFIG.EVOLUTION_API_URL}/instance/connectionState/${CONFIG.EVOLUTION_INSTANCE_NAME}`
    
    console.log('   Endpoint:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': CONFIG.EVOLUTION_API_KEY
      }
    })
    
    console.log('   Status:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Conexão bem-sucedida!')
      console.log('   Estado:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('   ❌ Erro na conexão')
      console.log('   Resposta:', errorText)
    }
  } catch (error) {
    console.log('   ❌ Erro ao conectar:', error.message)
  }
}

// 4. Testar envio de mensagem
async function testSendMessage() {
  console.log('\n📱 4. Testando Envio de Mensagem...')
  
  try {
    const url = `${CONFIG.EVOLUTION_API_URL}/message/sendText/${CONFIG.EVOLUTION_INSTANCE_NAME}`
    
    const payload = {
      number: CONFIG.INFRA_TEAM_PHONE,
      text: '🧪 Teste de diagnóstico WhatsApp\n\nSe você recebeu esta mensagem, a configuração está correta!'
    }
    
    console.log('   Endpoint:', url)
    console.log('   Telefone:', payload.number)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.EVOLUTION_API_KEY
      },
      body: JSON.stringify(payload)
    })
    
    console.log('   Status:', response.status, response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Mensagem enviada com sucesso!')
      console.log('   Resposta:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('   ❌ Erro ao enviar mensagem')
      console.log('   Resposta:', errorText)
    }
  } catch (error) {
    console.log('   ❌ Erro ao enviar:', error.message)
  }
}

// Executar testes
async function runDiagnostics() {
  await testConnection()
  await testSendMessage()
  
  console.log('\n' + '='.repeat(60))
  console.log('\n💡 Próximos Passos:')
  console.log('   1. Se os testes passaram, verifique os logs do servidor ao criar chamado')
  console.log('   2. Se os testes falharam, verifique a configuração da Evolution API')
  console.log('   3. Certifique-se de que o servidor Next.js foi reiniciado após alterar .env')
  console.log('\n')
}

runDiagnostics()
