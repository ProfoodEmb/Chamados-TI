// Script para criar usuário de teste via API
async function createTestUser() {
  try {
    console.log('🔍 Criando usuário de teste via API...')
    
    const userData = {
      name: "Teste Usuario",
      username: "teste",
      email: "teste@empresa.com",
      password: "teste123",
      role: "user",
      team: "user",
      setor: "TI",
      empresa: "profood"
    }

    console.log('📤 Dados do usuário:', userData)

    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Você precisa estar logado como admin para criar usuários
        // Vamos simular isso
      },
      body: JSON.stringify(userData)
    })

    console.log('📡 Status:', response.status)
    
    const result = await response.json()
    console.log('📦 Resultado:', result)

    if (response.ok) {
      console.log('✅ Usuário criado com sucesso!')
      console.log('🔐 Tente fazer login com:')
      console.log('   Username: teste')
      console.log('   Senha: teste123')
    } else {
      console.log('❌ Erro ao criar usuário:', result.error)
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

createTestUser()
