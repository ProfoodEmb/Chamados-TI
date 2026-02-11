// Script para testar envio de WhatsApp via Evolution API
// Usage: node scripts/dev/test-whatsapp.js

const testWhatsApp = async () => {
  try {
    console.log('🧪 Testando integração WhatsApp...\n')

    // Número de teste (substitua pelo seu número)
    const testPhone = process.env.TEST_PHONE || '5545999363214'
    
    console.log(`📱 Enviando mensagem de teste para: ${testPhone}`)
    console.log('⏳ Aguarde...\n')

    const response = await fetch('http://localhost:3000/api/test-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testPhone
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Teste concluído com sucesso!')
      console.log('📊 Resultado:', result)
      console.log('\n💡 Verifique seu WhatsApp para confirmar o recebimento da mensagem.')
    } else {
      console.error('❌ Erro no teste:', result)
      console.log('\n⚠️  Verifique:')
      console.log('   1. Evolution API está online?')
      console.log('   2. Instância está conectada?')
      console.log('   3. API Key está correta?')
      console.log('   4. Variáveis de ambiente configuradas?')
    }
  } catch (error) {
    console.error('❌ Erro ao executar teste:', error.message)
    console.log('\n⚠️  Certifique-se de que:')
    console.log('   1. O servidor está rodando (npm run dev)')
    console.log('   2. As variáveis de ambiente estão configuradas')
  }
}

testWhatsApp()
