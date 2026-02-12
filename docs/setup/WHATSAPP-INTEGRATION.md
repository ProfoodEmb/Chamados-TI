# Integração WhatsApp - Evolution API

Sistema de notificações automáticas via WhatsApp usando Evolution API.

## 📱 Funcionalidades

### Notificações Automáticas

1. **Quando um chamado é criado:**
   - ✅ Solicitante recebe confirmação com número do chamado
   - ✅ Técnico responsável recebe notificação (se atribuído)

2. **Quando o status muda:**
   - ✅ Solicitante é notificado sobre mudanças de status

3. **Quando o chamado é concluído:**
   - ✅ Solicitante recebe notificação de conclusão
   - ✅ Convite para avaliar o atendimento

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Evolution API - WhatsApp
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_INSTANCE_NAME=nome-da-instancia
EVOLUTION_API_KEY=sua-api-key
```

### Exemplo de Configuração

```env
EVOLUTION_API_URL=https://evolution.profood.com.br
EVOLUTION_INSTANCE_NAME=profood-tickets
EVOLUTION_API_KEY=B6D9C3E1-F2A4-4B5C-8D7E-9F1A2B3C4D5E
```

## 📋 Requisitos

1. **Evolution API instalada e configurada**
2. **Instância do WhatsApp conectada**
3. **Usuários com telefone cadastrado** no formato:
   - `(11) 99999-9999`
   - `11999999999`
   - `5511999999999`

## 🔧 Como Funciona

### Formato de Telefone

O sistema aceita vários formatos e converte automaticamente:
- `(11) 99999-9999` → `5511999999999`
- `11 99999-9999` → `5511999999999`
- `11999999999` → `5511999999999`
- `5511999999999` → `5511999999999` (já formatado)

### Mensagens Enviadas

#### Para o Solicitante (Criação)
```
🎫 Chamado Criado com Sucesso!

📋 Número: #000123
📝 Assunto: Problema com impressora
🟡 Urgência: Média
📁 Categoria: Infraestrutura

👨‍💼 Atribuído para: João Silva

📱 Você pode acompanhar o andamento do seu chamado pelo sistema.

Obrigado por utilizar nosso sistema de chamados!
```

#### Para o Técnico (Atribuição)
```
🔔 Novo Chamado Atribuído!

📋 Número: #000123
📝 Assunto: Problema com impressora
🟡 Urgência: Média
📁 Categoria: Infraestrutura

👤 Solicitante: Maria Santos
📧 Email: maria@profood.com.br

📄 Descrição:
A impressora não está imprimindo...

🏷️ Equipe: Infraestrutura
🖥️ Sistema: N/A

Acesse o sistema para mais detalhes e começar o atendimento.
```

## 🧪 Testando a Integração

### Script de Teste

Execute o script de teste para verificar se está funcionando:

```bash
node scripts/test-whatsapp.js
```

### Teste Manual via API

```bash
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999"}'
```

## 📊 Logs

O sistema registra todas as tentativas de envio:

```
📢 Iniciando envio de notificações WhatsApp...
📱 Enviando WhatsApp para: 5511999999999
✅ WhatsApp enviado com sucesso para: 5511999999999
📊 WhatsApp enviados: 2/2
```

## ⚠️ Tratamento de Erros

- Se a Evolution API não estiver configurada, as notificações são ignoradas
- Se um usuário não tiver telefone, apenas ele não recebe (outros sim)
- Erros no WhatsApp não impedem a criação do chamado
- Todos os erros são logados para debug

## 🔐 Segurança

- API Key é armazenada em variável de ambiente
- Nunca exposta no código ou logs
- Comunicação via HTTPS com a Evolution API

## 📝 Cadastro de Telefones

Para que os usuários recebam notificações, é necessário:

1. Cadastrar o telefone no perfil do usuário
2. Usar formato com DDD: `(11) 99999-9999`
3. O sistema converte automaticamente para o formato correto

## 🚀 Próximas Melhorias

- [ ] Enviar imagem/anexo junto com a notificação
- [ ] Botões interativos (aceitar/rejeitar chamado)
- [ ] Status de leitura da mensagem
- [ ] Notificações para grupos do WhatsApp
- [ ] Templates personalizados por equipe

## 📞 Suporte

Em caso de problemas:

1. Verifique se a Evolution API está online
2. Confirme que a instância está conectada
3. Valide a API Key
4. Verifique os logs do sistema
5. Teste com o script de teste

## 🔗 Links Úteis

- [Evolution API Docs](https://doc.evolution-api.com/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
