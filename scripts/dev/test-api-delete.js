const fetch = require('node-fetch');

async function testApiDelete() {
  try {
    // Primeiro, criar um aviso de teste
    console.log('📝 Criando aviso de teste...');
    
    const createResponse = await fetch('http://localhost:3001/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Teste API Delete',
        content: 'Aviso criado para testar exclusão via API',
        type: 'info',
        priority: 'low',
        level: 'general',
        active: true
      })
    });
    
    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log('❌ Erro ao criar aviso:', error);
      return;
    }
    
    const newNotice = await createResponse.json();
    console.log('✅ Aviso criado:', newNotice.id);
    
    // Agora tentar excluir
    console.log('🗑️ Tentando excluir via API...');
    
    const deleteResponse = await fetch(`http://localhost:3001/api/notices/${newNotice.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Aviso excluído com sucesso via API!');
    } else {
      const error = await deleteResponse.json();
      console.log('❌ Erro ao excluir via API:', error);
      console.log('Status:', deleteResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

testApiDelete();