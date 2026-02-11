// Script para testar envio de WhatsApp diretamente (sem precisar do servidor rodando)
// Usage: node scripts/dev/test-whatsapp-direct.js

// Carregar variáveis de ambiente manualmente
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  
  lines.forEach((line) => {
    // Ignorar comentários e linhas vazias
    if (line.trim().startsWith('#') || !line.trim()) return
    
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remove aspas duplas ou simples
      value = value.replace(/^["'](.*)["']$/, '$1')
      process.env[key] = value
    }
  })
}

loadEnv()

const testWhatsAppDirect = async () => {
  try {
    console.log('🧪 Testando integração WhatsApp...\n')

    // Verificar variáveis de ambiente
    const apiUrl = process.env.EVOLUTION_API_URL
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME
    const apiKey = process.env.EVOLUTION_API_KEY
    const testPhone = process.env.TEST_PHONE || '5545999363214'

    console.log('📋 Configuração:')
    console.log(`   API URL: ${apiUrl || '❌ NÃO CONFIGURADA'}`)
    console.log(`   Instância: ${instanceName || '❌ NÃO CONFIGURADA'}`)
    console.log(`   API Key: ${apiKey ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`)
    console.log(`   Telefone: ${testPhone}\n`)

    if (!apiUrl || !instanceName || !apiKey) {
      console.error('❌ Variáveis de ambiente não configuradas!')
      console.log('\n⚠️  Configure no arquivo .env:')
      console.log('   EVOLUTION_API_URL=https://sua-api.com')
      console.log('   EVOLUTION_INSTANCE_NAME=nome-instancia')
      console.log('   EVOLUTION_API_KEY=sua-api-key')
      process.exit(1)
    }

    // Formatar telefone
    const formattedPhone = testPhone.replace(/\D/g, '')
    console.log(`📱 Enviando mensagem de teste para: ${formattedPhone}`)
    console.log('⏳ Aguarde...\n')

    // Mensagem de teste
    const message = `🧪 *Teste de Notificação WhatsApp*

Este é um teste do sistema de notificações via WhatsApp.

✅ Se você recebeu esta mensagem, o sistema está funcionando corretamente!

_Sistema de Chamados - Profood_
_Teste realizado em: ${new Date().toLocaleString('pt-BR')}_`

    // Montar URL
    const url = `${apiUrl}/message/sendText/${instanceName}`
    
    console.log(`🔗 URL: ${url}`)
    console.log(`📤 Enviando...\n`)

    // Enviar requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message
      })
    })

    console.log(`📊 Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const result = await response.json()
      console.log('\n✅ Mensagem enviada com sucesso!')
      console.log('📋 Resposta da API:')
      console.log(JSON.stringify(result, null, 2))
      console.log('\n💡 Verifique seu WhatsApp para confirmar o recebimento.')
    } else {
      const errorText = await response.text()
      console.error('\n❌ Erro ao enviar mensagem!')
      console.error('📋 Resposta da API:')
      console.error(errorText)
      console.log('\n⚠️  Possíveis causas:')
      console.log('   1. Evolution API está offline')
      console.log('   2. Instância não está conectada')
      console.log('   3. API Key incorreta')
      console.log('   4. Número de telefone inválido')
      console.log('   5. Instância não tem permissão para enviar mensagens')
    }
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:', error.message)
    console.log('\n⚠️  Verifique:')
    console.log('   1. Conexão com a internet')
    console.log('   2. URL da Evolution API está correta')
    console.log('   3. Evolution API está acessível')
  }
}

testWhatsAppDirect()
