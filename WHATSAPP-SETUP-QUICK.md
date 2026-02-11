# Setup Rápido - WhatsApp Integration

## 🚀 Configuração em 3 Passos

### 1. Configure as Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# WhatsApp - Evolution API
EVOLUTION_API_URL=https://evolution.profood.com.br
EVOLUTION_INSTANCE_NAME=profood-tickets
EVOLUTION_API_KEY=sua-api-key-aqui
```

### 2. Cadastre Telefones dos Usuários

Os usuários precisam ter telefone cadastrado para receber notificações.

Formatos aceitos:
- `(11) 99999-9999`
- `11 99999-9999`
- `11999999999`
- `5511999999999`

### 3. Teste a Integração

```bash
# Teste via script
node scripts/dev/test-whatsapp.js

# Ou teste via API
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999"}'
```

## ✅ Pronto!

Agora quando um chamado for criado:
- ✅ Solicitante recebe confirmação no WhatsApp
- ✅ Técnico responsável recebe notificação
- ✅ Atualizações de status são enviadas automaticamente

## 📱 Mensagens Enviadas

### Para o Solicitante
```
🎫 Chamado Criado com Sucesso!
📋 Número: #000123
📝 Assunto: Problema com impressora
🟡 Urgência: Média
```

### Para o Técnico
```
🔔 Novo Chamado Atribuído!
📋 Número: #000123
👤 Solicitante: Maria Santos
🟡 Urgência: Média
```

## ⚠️ Importante

- Evolution API deve estar online e conectada
- Instância do WhatsApp deve estar ativa
- API Key deve estar correta
- Usuários devem ter telefone cadastrado

## 🔧 Troubleshooting

Se não funcionar:
1. Verifique se a Evolution API está online
2. Confirme que a instância está conectada
3. Valide a API Key no .env
4. Verifique os logs do console
5. Teste com o script de teste

## 📚 Documentação Completa

Veja `WHATSAPP-INTEGRATION.md` para mais detalhes.
