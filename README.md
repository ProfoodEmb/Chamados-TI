# 🎫 Sistema de Chamados Tuicial

Sistema completo de gerenciamento de chamados de TI com notificações WhatsApp, quadro Kanban e métricas em tempo real.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone <seu-repositorio>
cd chamados
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

4. Inicie o PostgreSQL com Docker
```bash
docker-compose up -d
```

5. Execute as migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

6. Crie um usuário admin
```bash
node scripts/create-admin.js
```

7. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📚 Documentação

Toda a documentação está organizada na pasta [`docs/`](./docs/):

- **[📖 Leia-me Primeiro](./docs/LEIA-ME-PRIMEIRO.md)** - Comece por aqui!
- **[🚀 Setup e Deploy](./docs/setup/)** - Guias de instalação e configuração
- **[✨ Features](./docs/features/)** - Documentação das funcionalidades
- **[🏗️ Arquitetura](./docs/architecture/)** - Estrutura e design do projeto
- **[📝 Changelog](./docs/changelog/)** - Histórico de mudanças

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 16 (Docker)
- **ORM**: Prisma
- **Autenticação**: Better Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Notificações**: WhatsApp via Evolution API
- **Realtime**: Polling otimizado

## ✨ Principais Features

- ✅ Sistema completo de chamados (criar, atribuir, finalizar)
- ✅ Quadro Kanban para visualização
- ✅ Notificações WhatsApp automáticas
- ✅ Dashboard de métricas com filtros
- ✅ Sistema de avisos
- ✅ Gerenciamento de usuários e equipes
- ✅ Autenticação segura
- ✅ Atualização em tempo real
- ✅ Upload de anexos
- ✅ Sistema de avaliação de chamados

## 📦 Estrutura do Projeto

```
chamados/
├── app/              # Next.js App Router (páginas e API)
├── components/       # Componentes React organizados por feature
├── lib/              # Bibliotecas, hooks e utilitários
├── prisma/           # Schema e migrations do banco
├── public/           # Assets estáticos
├── scripts/          # Scripts de automação e deploy
├── types/            # TypeScript types globais
└── docs/             # Documentação completa
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm start            # Inicia servidor de produção

# Banco de Dados
npx prisma studio    # Interface visual do banco
npx prisma migrate dev  # Cria nova migration

# Utilitários
node scripts/create-admin.js        # Cria usuário admin
node scripts/clear-tickets.js       # Limpa todos os chamados
```

## 🐳 Docker

O projeto usa Docker para o PostgreSQL:

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Status
docker-compose ps
```

## 🔐 Segurança

- Autenticação via Better Auth
- Senhas hasheadas com bcrypt
- Middleware de proteção de rotas
- Validação de permissões por role
- CORS configurado
- Variáveis de ambiente protegidas

## 📱 Notificações WhatsApp

O sistema integra com Evolution API para enviar notificações:
- Criação de chamado
- Atribuição de técnico
- Atualização de status
- Finalização de chamado

Veja [WhatsApp Setup](./docs/setup/WHATSAPP-SETUP-QUICK.md) para configurar.

## 🤝 Contribuindo

1. Leia a [documentação de arquitetura](./docs/architecture/)
2. Siga o [design system](./docs/architecture/DESIGN-SYSTEM-TUICIAL.md)
3. Consulte [prevenção de bugs](./docs/architecture/PREVENCAO-BUGS.md)
4. Faça commits descritivos

## 📄 Licença

Este projeto é proprietário da Tuicial.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação](./docs/)
2. Verifique o [changelog](./docs/changelog/)
3. Leia o guia de [troubleshooting](./docs/architecture/PREVENCAO-BUGS.md)

---

**Desenvolvido com ❤️ pela equipe Tuicial**
