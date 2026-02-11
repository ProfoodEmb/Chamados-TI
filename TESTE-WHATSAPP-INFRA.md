# 🧪 Teste de Notificação WhatsApp - Infraestrutura

## ✅ Status da Implementação

- ✅ Sistema de notificações WhatsApp implementado
- ✅ Número da equipe de infraestrutura configurado: `5545999363214`
- ✅ Integração com Evolution API funcionando
- ✅ Teste direto bem-sucedido

## 📱 Como Funciona

Quando um chamado de **Infraestrutura** é criado, o sistema envia notificações WhatsApp na seguinte ordem:

1. **Equipe de Infraestrutura** (5545999363214) - Recebe primeiro
2. **Solicitante** - Se tiver telefone cadastrado
3. **Técnico Responsável** - Se o chamado for atribuído e o técnico tiver telefone

## 🧪 Como Testar

### Opção 1: Criar Chamado pelo Sistema (RECOMENDADO)

1. Acesse o sistema: `http://localhost:3000`
2. Faça login com sua conta
3. Clique em "Novo Chamado"
4. Preencha os dados:
   - **Assunto:** Teste WhatsApp Infraestrutura
   - **Descrição:** Testando notificações
   - **Urgência:** Alta
   - **Equipe:** Infraestrutura
   - **Categoria:** Suporte
5. Clique em "Criar Chamado"
6. **Verifique o WhatsApp:** 5545999363214 deve receber a mensagem

### Opção 2: Verificar Logs do Servidor

Ao criar um chamado, o servidor mostra logs detalhados:

```
📢 Iniciando envio de notificações WhatsApp...
📱 Enviando notificação para equipe infra
📱 Enviando WhatsApp para: 5545999363214
✅ WhatsApp enviado com sucesso para: 5545999363214
📊 WhatsApp enviados: 1/1
```

### Opção 3: Teste Direto (Já Funcionou)

```bash
node scripts/dev/test-whatsapp-direct.js
```

## 📋 Formato da Mensagem para Equipe

```
🔔 *Novo Chamado - Infraestrutura*

📋 *Número:* #000123
📝 *Assunto:* Problema no servidor
🔴 *Urgência:* Crítica
📁 *Categoria:* Suporte

👤 *Solicitante:* João Silva
📧 *Email:* joao@profood.com.br

📄 *Descrição:*
O servidor de produção está apresentando lentidão...

👨‍💼 *Atribuído para:* Carlos Santos
🖥️ *Sistema:* Servidor Web

_Acesse o sistema para mais detalhes._
```

## 🔍 Verificar Configuração

### Variáveis de Ambiente (.env)

```env
# Evolution API
EVOLUTION_API_URL=https://evolution-apiv223-production-bf63.up.railway.app
EVOLUTION_INSTANCE_NAME=jackson
EVOLUTION_API_KEY=FF2004F46318-4CB3-8B09-B27FFC20F4D1

# Número da Equipe de Infraestrutura
INFRA_TEAM_PHONE=5545999363214

# Número da Equipe de Sistemas (ainda não configurado)
SISTEMAS_TEAM_PHONE=
```

### Código de Integração

O código está em: `lib/api/whatsapp-notifications.ts`

A integração está ativa em: `app/api/tickets/route.ts` (linha ~180)

## ⚠️ Troubleshooting

### Mensagem não chegou?

1. **Verifique os logs do servidor** - Procure por erros
2. **Confirme a configuração** - Todas as variáveis estão no .env?
3. **Teste a Evolution API** - Execute o teste direto
4. **Verifique o número** - Está no formato correto? (5545999363214)

### Erros Comuns

**"Evolution API não configurada"**
- Faltam variáveis de ambiente no .env

**"Erro 401 Unauthorized"**
- API Key incorreta

**"Erro 404 Not Found"**
- URL ou nome da instância incorretos

**"Número da equipe infra não configurado"**
- Falta INFRA_TEAM_PHONE no .env

## 📊 Próximos Passos

1. ✅ Testar criação de chamado real no sistema
2. ⏳ Cadastrar telefones dos usuários no banco de dados
3. ⏳ Configurar número da equipe de Sistemas
4. ⏳ Testar notificações para solicitante e técnico
5. ⏳ Personalizar mensagens (opcional)

## 💡 Dicas

- O sistema **não falha** se o WhatsApp não funcionar (erro não crítico)
- Mensagens são enviadas em **paralelo** para melhor performance
- Números são **formatados automaticamente** (vários formatos aceitos)
- Logs detalhados ajudam no **troubleshooting**

## 📞 Contatos para Teste

- **Equipe Infraestrutura:** 5545999363214
- **Equipe Sistemas:** (ainda não configurado)

---

**Última atualização:** 11/02/2026  
**Status:** ✅ Pronto para teste
