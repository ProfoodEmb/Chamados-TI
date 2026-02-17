// Testar login diretamente no banco
async function testLogin() {
  try {
    console.log('🔐 Testando autenticação...')
    
    const response = await fetch('http://localhost:3000/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jackson@empresa.com',
        password: 'teste123'
      })
    })

    console.log('📡 Status:', response.status)
    console.log('📡 Status Text:', response.statusText)
    
    const text = await response.text()
    console.log('📄 Resposta (texto):', text)
    
    try {
      const json = JSON.parse(text)
      console.log('📦 Resposta (JSON):', json)
    } catch (e) {
      console.log('⚠️ Resposta não é JSON válido')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testLogin()
