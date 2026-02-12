# 📚 Documentação do Sistema de Chamados

Bem-vindo à documentação completa do sistema de chamados Tuicial.

## 📖 Índice

### 🚀 Setup e Configuração
- [Migração PostgreSQL](./setup/MIGRACAO-POSTGRESQL.md) - Como migrar do SQLite para PostgreSQL
- [Deploy Rápido](./setup/DEPLOY-QUICK.md) - Guia rápido de deploy
- [Deploy Ubuntu](./setup/DEPLOY-UBUNTU.md) - Deploy em servidor Ubuntu
- [WhatsApp - Integração Completa](./setup/WHATSAPP-INTEGRATION.md) - Integração com Evolution API
- [WhatsApp - Setup Rápido](./setup/WHATSAPP-SETUP-QUICK.md) - Configuração rápida do WhatsApp
- [WhatsApp - Correções](./setup/WHATSAPP-FIX.md) - Troubleshooting WhatsApp
- [Webhooks](./setup/WEBHOOKS.md) - Configuração de webhooks
- [Webhook Setup](./setup/WEBHOOK-SETUP.md) - Setup detalhado de webhooks

### ✨ Features e Funcionalidades
- [Realtime](./features/REALTIME.md) - Sistema de atualização em tempo real
- [Realtime Fix](./features/REALTIME-FIX.md) - Correções do sistema realtime
- [Kanban](./features/KANBAN.md) - Quadro Kanban de chamados
- [Server Actions](./features/SERVER-ACTIONS.md) - Server Actions do Next.js
- [Socket.IO](./features/SOCKET-IO.md) - Implementação Socket.IO

### 🏗️ Arquitetura e Design
- [Design System](./architecture/DESIGN-SYSTEM-TUICIAL.md) - Sistema de design do projeto
- [Estrutura do Projeto](./architecture/PROJECT_STRUCTURE.md) - Organização de pastas
- [Plano de Reorganização](./architecture/REORGANIZATION_PLAN.md) - Plano de refatoração
- [Resumo da Reorganização](./architecture/REORGANIZATION_SUMMARY.md) - Resumo das mudanças
- [Reorganização Profissional](./architecture/REORGANIZACAO-PROFISSIONAL.md) - Estrutura profissional
- [Análise Completa](./architecture/ANALISE-COMPLETA.md) - Análise técnica completa
- [Melhorias Sugeridas](./architecture/MELHORIAS-SUGERIDAS.md) - Sugestões de melhorias
- [Checklist Pré-Produção](./architecture/PRE-PRODUCTION-CHECKLIST.md) - Checklist antes do deploy
- [Prevenção de Bugs](./architecture/PREVENCAO-BUGS.md) - Boas práticas
- [Auditoria de Segurança](./architecture/SECURITY-AUDIT.md) - Análise de segurança
- [Correções de Segurança](./architecture/SECURITY-FIXES-APPLIED.md) - Correções aplicadas
- [Resumo Final](./architecture/RESUMO-FINAL.md) - Resumo geral do projeto

### 📝 Changelog
- [11/02/2026](./changelog/CHANGELOG-11-02-2026.md) - Mudanças de 11 de fevereiro

### 📖 Leia-me Primeiro
- [Guia Inicial](./LEIA-ME-PRIMEIRO.md) - Comece por aqui!

## 🎯 Links Rápidos

### Para Desenvolvedores
1. [Leia-me Primeiro](./LEIA-ME-PRIMEIRO.md) - Visão geral do projeto
2. [Estrutura do Projeto](./architecture/PROJECT_STRUCTURE.md) - Como o código está organizado
3. [Design System](./architecture/DESIGN-SYSTEM-TUICIAL.md) - Padrões de UI/UX

### Para Deploy
1. [Deploy Rápido](./setup/DEPLOY-QUICK.md) - Guia rápido
2. [Migração PostgreSQL](./setup/MIGRACAO-POSTGRESQL.md) - Setup do banco
3. [WhatsApp Setup](./setup/WHATSAPP-SETUP-QUICK.md) - Notificações

### Para Troubleshooting
1. [Prevenção de Bugs](./architecture/PREVENCAO-BUGS.md) - Evite problemas comuns
2. [Realtime Fix](./features/REALTIME-FIX.md) - Problemas de atualização
3. [WhatsApp Fix](./setup/WHATSAPP-FIX.md) - Problemas com notificações

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Banco de Dados**: PostgreSQL 16 (Docker)
- **ORM**: Prisma
- **Autenticação**: Better Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Realtime**: Polling (20s/60s)
- **Notificações**: WhatsApp (Evolution API)

## 📦 Estrutura de Pastas

```
chamados/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── lib/              # Bibliotecas e utilitários
├── prisma/           # Schema e migrations
├── public/           # Assets estáticos
├── scripts/          # Scripts de automação
├── types/            # TypeScript types
└── docs/             # Esta documentação
```

## 🤝 Contribuindo

Ao adicionar nova documentação:
1. Coloque em uma das pastas apropriadas (setup, features, architecture, changelog)
2. Atualize este README.md com o link
3. Use markdown formatado e claro
4. Inclua exemplos quando possível

## 📞 Suporte

Para dúvidas ou problemas, consulte primeiro:
1. [Leia-me Primeiro](./LEIA-ME-PRIMEIRO.md)
2. [Prevenção de Bugs](./architecture/PREVENCAO-BUGS.md)
3. [Análise Completa](./architecture/ANALISE-COMPLETA.md)
