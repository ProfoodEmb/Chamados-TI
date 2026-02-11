# Sistema de Webhooks - Notificações de Chamados

Este documento explica como configurar e usar o sistema de webhooks para receber notificações quando novos chamados são criados.

## 📋 O que são Webhooks?

Webhooks são URLs que recebem notificações automáticas quando eventos acontecem no sistema. Quando um novo chamado é criado, o sistema envia automaticamente os dados do chamado para todos os webhooks configurados.

## 🔧 Configuração

### 1. Adicionar URL do Webhook

Edite o arquivo `.env` na raiz do projeto e adicione a URL do seu webhook:

```env
# n8n Webhook (Profood)
N8N_WEBHOOK_URL="https://n8n.profood.com.br/webhook/sua-url-aqui"

# Discord
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Slack
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Webhook Customizado
CUSTOM_WEBHOOK_URL="https://seu-servidor.com/webhook"
```

### 2. Reiniciar o Servidor

Após adicionar a URL, reinicie o servidor Next.js:

```bash
npm run dev
```

## 📤 Formato dos Dados Enviados

Quando um chamado é criado, o webhook recebe um POST com o seguinte formato JSON:

```json
{
  "event": "ticket_created",
  "timestamp": "2026-02-10T19:28:47.579Z",
  "ticket": {
    "id": "abc123",
    "number": "000123",
    "subject": "Problema no sistema",
    "description": "Descrição detalhada do problema...",
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

### Campos Importantes

- **event**: Tipo do evento (sempre "ticket_created" para novos chamados)
- **timestamp**: Data/hora do envio da notificação
- **ticket.number**: Número do chamado (ex: "000123")
- **ticket.urgency**: Nível de urgência (low, medium, high, critical)
- **ticket.urgencyLabel**: Label formatado com emoji (🟢 Baixa, 🟡 Média, 🟠 Alta, 🔴 Crítica)
- **ticket.team**: Equipe responsável (infra, sistemas)
- **ticket.teamLabel**: Nome formatado da equipe
- **ticket.assignedTo**: Técnico atribuído (pode ser null se não atribuído)

## 🧪 Testar Webhook

### Teste Manual

Execute o script de teste para enviar uma notificação de teste:

```bash
node scripts/test-webhook-n8n.js
```

### Teste com Chamado Real

1. Crie um novo chamado no sistema
2. Verifique se a notificação chegou no seu webhook
3. Confira os logs do servidor para ver o status do envio

## 🔍 Logs e Debug

O sistema registra logs detalhados sobre o envio de webhooks:

```
📢 Iniciando envio de notificações via webhook...
📋 Webhooks ativos: 1
📤 Enviando notificação para: n8n - Profood
✅ Notificação enviada com sucesso para: n8n - Profood
📊 Notificações enviadas: 1/1
```

Se houver erro:

```
❌ Erro ao enviar para n8n - Profood: 404 Not Found
```

## 🎯 Casos de Uso

### n8n - Automação

Use o n8n para:
- Enviar mensagens no WhatsApp quando um chamado crítico é criado
- Criar tarefas no Trello/Asana automaticamente
- Enviar emails personalizados para a equipe
- Integrar com outros sistemas internos

### Discord

Configure um webhook do Discord para:
- Notificar a equipe TI em um canal específico
- Criar threads automáticas para cada chamado
- Usar bots para responder comandos

### Slack

Configure um webhook do Slack para:
- Notificar canais específicos por equipe
- Criar alertas para chamados críticos
- Integrar com workflows do Slack

## 🔐 Segurança

- **Nunca compartilhe URLs de webhook publicamente**
- As URLs contêm tokens secretos que dão acesso ao seu sistema
- Mantenha o arquivo `.env` fora do controle de versão (já está no .gitignore)
- Use HTTPS sempre que possível

## 🛠️ Configuração no n8n

### Modo de Teste

1. Abra seu workflow no n8n
2. Adicione um nó "Webhook"
3. Configure o método como POST
4. Clique em "Execute Workflow" (botão de play)
5. O webhook ficará ativo por uma chamada
6. Execute o teste: `node scripts/test-webhook-n8n.js`

### Modo de Produção

1. No nó Webhook, mude de "Test URL" para "Production URL"
2. Ative o workflow (toggle no canto superior direito)
3. O webhook ficará sempre ativo
4. Atualize a URL no `.env` com a URL de produção

## 📊 Regras de Auto-atribuição

O sistema já atribui automaticamente alguns chamados:

- **Automação de Sistemas** → Jackson
- **eCalc** → Rafael
- **Questor** → Rafael
- **Outros Sistemas** → Rafael

Essas atribuições são feitas ANTES do webhook ser enviado, então o campo `assignedTo` já virá preenchido.

## 🆘 Troubleshooting

### Webhook não está recebendo notificações

1. Verifique se a URL está correta no `.env`
2. Confirme que o servidor foi reiniciado após alterar o `.env`
3. Verifique os logs do servidor Next.js
4. Teste com o script: `node scripts/test-webhook-n8n.js`

### Erro 404 no n8n

- O workflow precisa estar ativo (modo produção)
- Ou você precisa clicar em "Execute Workflow" (modo teste)

### Webhook recebe dados mas não processa

- Verifique o formato dos dados no n8n
- Confirme que o nó Webhook está configurado para JSON
- Adicione um nó "Function" para debug e ver os dados recebidos

## 📝 Exemplo de Workflow n8n

```
Webhook (POST)
  ↓
[Filtrar por urgência]
  ↓
IF urgency === "critical"
  ↓
  [Enviar WhatsApp]
  [Enviar Email]
  [Criar Alerta]
ELSE
  ↓
  [Registrar no Log]
```

## 🔄 Próximos Passos

Você pode expandir o sistema de webhooks para:

- Notificar quando um chamado é atualizado
- Notificar quando um chamado é fechado
- Notificar quando um chamado recebe uma mensagem
- Enviar relatórios diários/semanais
- Alertas de SLA (tempo de resposta)

---

**Desenvolvido para o Sistema de Chamados Profood**
