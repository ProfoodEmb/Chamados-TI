// Script para verificar se as variáveis de ambiente estão carregadas

console.log('🔍 Verificando variáveis de ambiente de webhook...\n')

console.log('Variáveis disponíveis:')
console.log('  N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL || '❌ NÃO DEFINIDA')
console.log('  DISCORD_WEBHOOK_URL:', process.env.DISCORD_WEBHOOK_URL || '❌ NÃO DEFINIDA')
console.log('  SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL || '❌ NÃO DEFINIDA')
console.log('  CUSTOM_WEBHOOK_URL:', process.env.CUSTOM_WEBHOOK_URL || '❌ NÃO DEFINIDA')

console.log('\n📋 Status:')

if (process.env.N8N_WEBHOOK_URL) {
  console.log('✅ n8n webhook configurado')
  console.log('   URL:', process.env.N8N_WEBHOOK_URL)
} else {
  console.log('❌ n8n webhook NÃO configurado')
  console.log('   Adicione N8N_WEBHOOK_URL no arquivo .env')
}

console.log('\n⚠️  IMPORTANTE:')
console.log('   Se você acabou de adicionar a variável no .env,')
console.log('   você precisa REINICIAR o servidor Next.js!')
console.log('   Pressione Ctrl+C no terminal do servidor e rode: npm run dev')
