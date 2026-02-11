# 🚀 Guia Rápido - Configurar Webhook n8n

## ✅ Checklist de Configuração

### 1️⃣ Verificar arquivo .env

Abra o arquivo `.env` na raiz do projeto e confirme que esta linha existe:

```env
N8N_WEBHOOK_URL="https://n8n.profood.com.br/webhook-test/9c5f790a-3833-49fd-9499-89354c3d80f3"
```

### 2️⃣ Reiniciar o servidor Next.js

**IMPORTANTE:** O servidor precisa ser reiniciado para carregar a variável de ambiente!

1. No terminal onde o Next.js está rodando, pressione `Ctrl + C`
2. Execute novamente: `npm run dev`
3. Aguarde o servidor iniciar completamente

### 3️⃣ Ativar o workflow no n8n

**Opção A - Modo de Teste (uma chamada apenas):**
1. Abra o workflow no n8n
2. Clique no botão "Execute Workflow" (▶️ play)
3. O webhook ficará ativo por UMA chamada
4. Crie um chamado no sistema
5. Verifique se chegou no n8n

**Opção B - Modo de Produção (sempre ativo):**
1. Abra o workflow no n8n
2. No nó Webhook, mude de "Test URL" para "Production URL"
3. Ative o workflow (toggle no canto superior direito)
4. O webhook ficará sempre ativo
5. Crie quantos chamados quiser

### 4️⃣ Testar a configuração

Execute este comando para verificar se a variável está carregada:

```bash
node scripts/check-env-webhook.js
```

Deve mostrar:
```
✅ n8n webhook configurado
   URL: https://n8n.profood.com.br/webhook-test/...
```

### 5️⃣ Criar um chamado de teste

1. Acesse o sistema de chamados
2. Crie um novo chamado
3. Preencha os dados
4. Clique em "Criar Chamado"

### 6️⃣ Verificar os logs

No terminal do Next.js, você deve ver:

```
📢 Iniciando envio de notificações via webhook...
📋 Webhooks ativos: 1
📤 Enviando notificação para: n8n - Profood
✅ Notificação enviada com sucesso para: n8n - Profood
📊 Notificações enviadas: 1/1
```

### 7️⃣ Verificar no n8n

No n8n, você deve ver os dados do chamado na aba "OUTPUT".

---

## 🐛 Troubleshooting

### Problema: "Nenhum webhook configurado"

**Solução:**
1. Verifique se o arquivo `.env` tem a linha `N8N_WEBHOOK_URL=...`
2. Reinicie o servidor Next.js
3. Execute: `node scripts/check-env-webhook.js`

### Problema: "404 Not Found" no n8n

**Solução:**
- O workflow não está ativo
- Clique em "Execute Workflow" no n8n
- Ou ative o workflow em modo produção

### Problema: Webhook não recebe dados

**Solução:**
1. Verifique os logs do Next.js
2. Procure por mensagens de erro
3. Execute o teste: `node scripts/test-webhook-n8n.js`

### Problema: "Cannot find module 'dotenv'"

**Solução:**
- Ignore este erro, o script funciona sem dotenv
- A URL está hardcoded no script de teste

---

## 📊 Formato dos Dados Enviados

O webhook recebe este JSON:

```json
{
  "event": "ticket_created",
  "timestamp": "2026-02-10T19:28:47.579Z",
  "ticket": {
    "id": "abc123",
    "number": "000123",
    "subject": "Título do chamado",
    "description": "Descrição...",
    "category": "Suporte",
    "urgency": "high",
    "urgencyLabel": "🟠 Alta",
    "status": "Aberto",
    "team": "sistemas",
    "teamLabel": "Sistemas",
    "service": "eCalc",
    "createdAt": "2026-02-10T19:28:47.584Z",
    "requester": {
      "id": "user-123",
      "name": "João Silva",
      "email": "joao@profood.com.br",
      "setor": "Financeiro",
      "empresa": "profood"
    },
    "assignedTo": {
      "id": "tech-456",
      "name": "Rafael Silva",
      "email": "rafael@profood.com.br"
    }
  }
}
```

---

## ✨ Dicas

- Use o modo de teste do n8n para desenvolvimento
- Use o modo de produção quando estiver tudo funcionando
- Monitore os logs do Next.js para debug
- O webhook não bloqueia a criação do chamado se falhar

---

**Precisa de ajuda?** Verifique o arquivo `WEBHOOKS.md` para documentação completa.
