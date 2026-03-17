# 🎫 Sistema de Chamados Tuicial

Sistema completo de gerenciamento de chamados de TI com notificações WhatsApp, quadro Kanban e métricas em tempo real.

## 🚀 Quick Start

### Pré-requisitos
- Docker Desktop
- Git

### Subir em outro PC via GitHub

1. Clone o repositório
```bash
git clone <seu-repositorio>
cd chamados
```

2. Crie o arquivo de ambiente
```bash
cp .env.example .env
```

3. Edite o `.env`
- Defina `BETTER_AUTH_SECRET`
- Revise integrações opcionais como Evolution, Constel e PrintServe

4. Suba tudo com Docker
```bash
docker compose up -d --build
```

5. Acesse o sistema
```text
http://localhost:3000
```

O container da aplicação já executa automaticamente:
- `prisma db push`
- `npm run db:seed`
- `npm run start`

### Desenvolvimento local sem Docker para o app

Se quiser rodar o Next.js fora do container e usar só o banco no Docker:

1. Instale as dependências
```bash
npm install
```

2. Suba apenas o banco
```bash
docker compose up -d postgres
```

3. Gere o schema no banco
```bash
npm run db:push
npm run db:seed
```

4. Inicie o ambiente de desenvolvimento
```bash
npm run dev
```

## 📚 Documentação

Toda a documentação está organizada na pasta [`docs/`](./docs/):

- **[📖 Leia-me Primeiro](./docs/LEIA-ME-PRIMEIRO.md)** - Comece por aqui!
- **[🚀 Setup e Deploy](./docs/setup/)** - Guias de instalação e configuração
- **[✨ Features](./docs/features/)** - Documentação das funcionalidades
- **[🏗️ Arquitetura](./docs/architecture/)** - Estrutura e design do projeto
- **[📝 Changelog](./docs/changelog/)** - Histórico de mudanças

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
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

O projeto pode ser executado inteiro com Docker:

```bash
# Subir app + banco
docker compose up -d --build

# Ver logs do app
docker compose logs -f app

# Ver status
docker compose ps

# Parar
docker compose down
```

### Persistência

- Banco PostgreSQL: volume `postgres_data`
- Uploads/anexos: volume `uploads_data`

Se você quiser levar tambem os dados de um PC para outro, precisara exportar o banco e copiar os arquivos de upload alem do GitHub.

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

