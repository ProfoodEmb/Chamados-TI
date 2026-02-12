# ✅ Checklist Pré-Produção - Sistema de Chamados

## 🚨 AÇÕES URGENTES (Fazer AGORA)

### 1. Segurança Crítica
```bash
# Remover .env do Git
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "security: remove .env from version control"

# Gerar novo BETTER_AUTH_SECRET
openssl rand -base64 32
# Copiar e salvar no .env

# Mudar senha do banco
sudo -u postgres psql
ALTER USER chamados_user WITH PASSWORD 'SuaSenhaForte123!@#';
\q

# Atualizar DATABASE_URL no .env
```

### 2. Regenerar Credenciais
- [ ] Nova senha do PostgreSQL
- [ ] Novo BETTER_AUTH_SECRET
- [ ] Nova EVOLUTION_API_KEY
- [ ] Novo webhook n8n

## 📊 Status das Correções

### ✅ Já Corrigido
- [x] Middleware valida roles no servidor
- [x] Rotas públicas minimizadas
- [x] API key removida de scripts
- [x] Validação de permissões em APIs

### ⚠️ Precisa Fazer
- [ ] Remover .env do Git
- [ ] Gerar novas credenciais
- [ ] Implementar rate limiting
- [ ] Adicionar validação de input (Zod)

## 🖥️ Requisitos do Servidor (100 Usuários)

```
CPU: 4 cores
RAM: 8 GB
Disco: 50 GB SSD
SO: Ubuntu Server 22.04 LTS
```

## 🔒 Segurança

### Crítico
- [ ] .env não está no Git
- [ ] Credenciais regeneradas
- [ ] Firewall configurado
- [ ] SSL/HTTPS ativo

### Importante
- [ ] Rate limiting implementado
- [ ] Validação de input
- [ ] Logs sanitizados
- [ ] Backups configurados

### Recomendado
- [ ] CORS configurado
- [ ] CSP implementado
- [ ] Monitoramento ativo
- [ ] Alertas configurados

## 🚀 Deploy

### Preparação
- [ ] Servidor Ubuntu provisionado
- [ ] Node.js 20.x instalado
- [ ] PostgreSQL 15+ instalado
- [ ] PM2 instalado
- [ ] Nginx instalado

### Configuração
- [ ] Banco de dados criado
- [ ] .env configurado (novo, não copiar do dev)
- [ ] Migrations executadas
- [ ] Build realizado
- [ ] PM2 configurado

### Rede
- [ ] Nginx configurado
- [ ] SSL/HTTPS ativo
- [ ] Firewall configurado
- [ ] DNS apontando

### Testes
- [ ] Login funciona
- [ ] Criar ticket funciona
- [ ] WhatsApp funciona
- [ ] Permissões funcionam
- [ ] Polling funciona

## 📝 Documentos Importantes

1. **SECURITY-AUDIT.md** - Análise completa de segurança
2. **SECURITY-FIXES-APPLIED.md** - Correções já aplicadas
3. **DEPLOY-UBUNTU.md** - Guia completo de deploy
4. **DEPLOY-QUICK.md** - Guia rápido de deploy

## ⚡ Comandos Rápidos

### Verificar Segurança
```bash
# Verificar se .env está no Git
git ls-files | grep .env

# Verificar vulnerabilidades
npm audit

# Gerar secret
openssl rand -base64 32
```

### Deploy
```bash
# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "chamados" -i max -- start
pm2 save

# Ver logs
pm2 logs chamados
```

### Backup
```bash
# Backup do banco
pg_dump -U chamados_user chamados > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U chamados_user chamados < backup_20260211.sql
```

## 🎯 Ordem de Execução

1. **Corrigir segurança** (1-2 horas)
   - Remover .env do Git
   - Gerar novas credenciais
   - Testar localmente

2. **Preparar servidor** (2-3 horas)
   - Provisionar servidor
   - Instalar dependências
   - Configurar firewall

3. **Deploy** (1-2 horas)
   - Clonar código
   - Configurar .env
   - Build e iniciar

4. **Testes** (1 hora)
   - Testar todas as funcionalidades
   - Verificar segurança
   - Monitorar logs

5. **Go Live** 🚀
   - Comunicar equipe
   - Monitorar primeiras horas
   - Estar disponível para suporte

## 📞 Contatos de Emergência

- Servidor caiu: Verificar PM2 e logs
- Banco de dados: Verificar PostgreSQL
- WhatsApp não funciona: Verificar Evolution API
- Erro 502: Verificar Nginx e aplicação

## 🎉 Pós-Deploy

- [ ] Monitorar logs por 24h
- [ ] Coletar feedback da equipe
- [ ] Documentar problemas encontrados
- [ ] Planejar melhorias

---

**Tempo estimado total**: 6-8 horas
**Dificuldade**: Média
**Risco**: Baixo (se seguir o checklist)
