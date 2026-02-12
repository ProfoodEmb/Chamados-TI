# 🔒 Auditoria de Segurança - Sistema de Chamados

## ⚠️ PROBLEMAS CRÍTICOS (Corrigir ANTES de produção)

### 1. 🚨 CRÍTICO: Credenciais Expostas no .env
**Arquivo**: `.env`
**Problema**: Arquivo `.env` contém credenciais reais e está versionado

**Credenciais expostas:**
```env
DATABASE_URL="postgresql://chamados:chamados123@localhost:5432/chamados_db"
BETTER_AUTH_SECRET="sua-chave-secreta-super-segura-aqui-mude-em-producao"
EVOLUTION_API_KEY="FF2004F46318-4CB3-8B09-B27FFC20F4D1"
```

**Risco**: 
- Qualquer pessoa com acesso ao repositório pode acessar o banco de dados
- Pode enviar mensagens WhatsApp pela sua API

**Solução URGENTE**:
```bash
# 1. Remover .env do Git
git rm --cached .env
echo ".env" >> .gitignore

# 2. Gerar novas credenciais
# - Mudar senha do banco de dados
# - Gerar novo BETTER_AUTH_SECRET
# - Regenerar EVOLUTION_API_KEY

# 3. Commit das mudanças
git add .gitignore
git commit -m "security: remove .env from version control"
```

### 2. 🚨 CRÍTICO: API Key Hardcoded em Script
**Arquivo**: `scripts/dev/diagnose-whatsapp.js`
**Linha**: 6

```javascript
EVOLUTION_API_KEY: 'FF2004F46318-4CB3-8B09-B27FFC20F4D1',
```

**Solução**:
```javascript
// Remover o objeto CONFIG hardcoded
// Usar apenas variáveis de ambiente
const CONFIG = {
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
  EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
  INFRA_TEAM_PHONE: process.env.INFRA_TEAM_PHONE
}
```

### 3. ⚠️ ALTO: Senha Padrão em Script de Seed
**Arquivo**: `scripts/dev/create-sistemas-users.js`
**Linha**: 43

```javascript
const hashedPassword = await bcrypt.hash('senha123', 10)
```

**Risco**: Todos os usuários criados têm senha "senha123"

**Solução**:
- Forçar troca de senha no primeiro login
- Ou gerar senhas aleatórias e enviar por email

### 4. ⚠️ ALTO: Middleware Não Valida Role no Servidor
**Arquivo**: `middleware.ts`
**Linha**: 31-34

```typescript
// TODO: Implementar verificação de role no servidor
```

**Risco**: Usuários comuns podem acessar rotas /ti/* modificando o client-side

**Solução**: Implementar verificação de role no middleware

### 5. ⚠️ MÉDIO: Rotas Públicas Demais
**Arquivo**: `middleware.ts`

Rotas públicas sem autenticação:
- `/api/users/ti` - Lista usuários da TI (deveria ser protegida)
- `/api/metrics` - Métricas do sistema (deveria ser protegida)
- `/api/test-whatsapp` - Teste de WhatsApp (OK para dev, remover em prod)

**Solução**: Proteger essas rotas com autenticação

### 6. ⚠️ MÉDIO: Sem Rate Limiting
**Problema**: APIs não têm limite de requisições

**Risco**: 
- Ataques de força bruta no login
- Spam de criação de tickets
- DDoS simples

**Solução**: Implementar rate limiting

### 7. ⚠️ MÉDIO: Sem Validação de Input
**Problema**: APIs não validam dados de entrada adequadamente

**Risco**: 
- SQL Injection (mitigado pelo Prisma)
- XSS em campos de texto
- Dados inválidos no banco

**Solução**: Implementar validação com Zod

### 8. ⚠️ BAIXO: Logs Expõem Informações Sensíveis
**Problema**: Logs mostram dados completos de tickets, usuários, etc.

**Exemplo**:
```typescript
console.log('🔄 API PATCH recebeu:', { ticketId, status, userId, userRole })
```

**Solução**: Remover ou sanitizar logs em produção

## ✅ PONTOS POSITIVOS

1. ✅ Uso de Prisma (previne SQL Injection)
2. ✅ Better Auth (autenticação segura)
3. ✅ Senhas hasheadas com bcrypt
4. ✅ HTTPS recomendado no guia de deploy
5. ✅ Separação de roles (admin, lider, func, user)
6. ✅ Validação de permissões nas APIs
7. ✅ Timeout em requisições WhatsApp

## 🔧 CORREÇÕES NECESSÁRIAS

### Prioridade 1 (URGENTE - Antes de produção)
- [ ] Remover .env do Git
- [ ] Gerar novas credenciais
- [ ] Remover API key hardcoded do script
- [ ] Implementar validação de role no middleware
- [ ] Proteger rotas públicas desnecessárias

### Prioridade 2 (Importante)
- [ ] Implementar rate limiting
- [ ] Adicionar validação de input com Zod
- [ ] Forçar troca de senha no primeiro login
- [ ] Remover rota /api/test-whatsapp em produção

### Prioridade 3 (Recomendado)
- [ ] Sanitizar logs em produção
- [ ] Adicionar CORS configurado
- [ ] Implementar CSP (Content Security Policy)
- [ ] Adicionar logs de auditoria

## 📋 CHECKLIST DE SEGURANÇA PRÉ-PRODUÇÃO

### Configuração
- [ ] .env não está no Git
- [ ] Todas as credenciais foram regeneradas
- [ ] BETTER_AUTH_SECRET é forte (32+ caracteres aleatórios)
- [ ] DATABASE_URL usa senha forte
- [ ] BETTER_AUTH_URL aponta para domínio de produção

### Código
- [ ] Sem credenciais hardcoded
- [ ] Sem senhas padrão em scripts
- [ ] Middleware valida roles no servidor
- [ ] Rotas sensíveis estão protegidas
- [ ] Rate limiting implementado

### Servidor
- [ ] Firewall configurado (apenas portas 22, 80, 443)
- [ ] SSL/HTTPS configurado
- [ ] PostgreSQL não aceita conexões externas
- [ ] Usuário do banco tem apenas permissões necessárias
- [ ] Backups automáticos configurados

### Monitoramento
- [ ] Logs de erro configurados
- [ ] Alertas de falhas configurados
- [ ] Monitoramento de recursos (CPU, RAM, Disco)

## 🚀 PRÓXIMOS PASSOS

1. **Corrigir problemas críticos** (itens 1-4)
2. **Testar em ambiente de staging**
3. **Fazer auditoria de penetração básica**
4. **Documentar procedimentos de segurança**
5. **Treinar equipe sobre boas práticas**

## 📞 Recomendações Adicionais

### Backup
- Backup diário do banco de dados
- Testar restauração de backup mensalmente
- Manter backups em local separado

### Atualizações
- Atualizar dependências mensalmente
- Monitorar vulnerabilidades (npm audit)
- Manter Node.js e PostgreSQL atualizados

### Acesso
- Usar chaves SSH ao invés de senhas
- Desabilitar login root via SSH
- Implementar 2FA para contas admin

### Monitoramento
- Configurar alertas de erro
- Monitorar tentativas de login falhas
- Revisar logs semanalmente
