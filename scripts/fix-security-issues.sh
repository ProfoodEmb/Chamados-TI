#!/bin/bash

echo "🔒 Corrigindo Problemas de Segurança Críticos"
echo "=============================================="
echo ""

# 1. Remover .env do Git
echo "1️⃣ Removendo .env do controle de versão..."
git rm --cached .env 2>/dev/null || echo "   .env já não está no Git"

# 2. Adicionar .env ao .gitignore se não estiver
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    echo "   ✅ .env adicionado ao .gitignore"
else
    echo "   ✅ .env já está no .gitignore"
fi

# 3. Gerar novo BETTER_AUTH_SECRET
echo ""
echo "2️⃣ Gerando novo BETTER_AUTH_SECRET..."
NEW_SECRET=$(openssl rand -base64 32)
echo "   Novo secret: $NEW_SECRET"
echo "   ⚠️  COPIE E SALVE ESTE SECRET NO SEU .env!"

# 4. Criar backup do .env atual
echo ""
echo "3️⃣ Criando backup do .env atual..."
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "   ✅ Backup criado"
fi

# 5. Criar novo .env.local para desenvolvimento
echo ""
echo "4️⃣ Criando .env.local para desenvolvimento..."
cat > .env.local << EOF
# Database (desenvolvimento local)
DATABASE_URL="postgresql://chamados:MUDE_ESTA_SENHA@localhost:5432/chamados_db"

# Better Auth
BETTER_AUTH_SECRET="$NEW_SECRET"
BETTER_AUTH_URL="http://localhost:3000"

# WhatsApp - Evolution API
EVOLUTION_API_URL=""
EVOLUTION_INSTANCE_NAME=""
EVOLUTION_API_KEY=""

# Números de WhatsApp das Equipes
INFRA_TEAM_PHONE=""
SISTEMAS_TEAM_PHONE=""

# Webhooks (opcional)
DISCORD_WEBHOOK_URL=""
SLACK_WEBHOOK_URL=""
EOF
echo "   ✅ .env.local criado"

# 6. Adicionar .env.local ao .gitignore
if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "   ✅ .env.local adicionado ao .gitignore"
fi

# 7. Commit das mudanças
echo ""
echo "5️⃣ Commitando mudanças de segurança..."
git add .gitignore
git commit -m "security: remove sensitive files from version control" 2>/dev/null || echo "   Nada para commitar"

echo ""
echo "✅ CORREÇÕES APLICADAS!"
echo ""
echo "⚠️  AÇÕES NECESSÁRIAS:"
echo "   1. Copie o novo BETTER_AUTH_SECRET para seu .env de produção"
echo "   2. Mude a senha do banco de dados PostgreSQL"
echo "   3. Regenere a EVOLUTION_API_KEY no Evolution API"
echo "   4. Crie um novo webhook no n8n"
echo "   5. Atualize o .env.local com suas credenciais de desenvolvimento"
echo ""
echo "📖 Veja SECURITY-AUDIT.md para mais detalhes"
