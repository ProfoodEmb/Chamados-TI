# Migração para PostgreSQL com Docker

Este guia explica como migrar do SQLite para PostgreSQL usando Docker.

## Passo 1: Iniciar o PostgreSQL com Docker

```bash
# Iniciar o container do PostgreSQL
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

## Passo 2: Instalar dependências do PostgreSQL

```bash
npm install
```

## Passo 3: Gerar o cliente Prisma atualizado

```bash
npx prisma generate
```

## Passo 4: Criar as tabelas no PostgreSQL

```bash
npx prisma db push
```

## Passo 5: (Opcional) Migrar dados do SQLite

Se você quiser migrar os dados existentes do SQLite para o PostgreSQL:

```bash
# 1. Exportar dados do SQLite
npx prisma db pull --schema=prisma/schema-sqlite.prisma

# 2. Criar um script de migração (manual)
# Você precisará exportar os dados e importá-los manualmente
```

## Passo 6: Iniciar a aplicação

```bash
npm run dev
```

## Comandos Úteis

### Parar o PostgreSQL
```bash
docker-compose down
```

### Ver logs do PostgreSQL
```bash
docker-compose logs -f postgres
```

### Acessar o PostgreSQL via CLI
```bash
docker-compose exec postgres psql -U tuicial -d tuicial_db
```

### Resetar o banco (CUIDADO: apaga todos os dados)
```bash
npx prisma db push --force-reset
```

## Credenciais do Banco

- **Host:** localhost
- **Porta:** 5432
- **Usuário:** tuicial
- **Senha:** tuicial_password_2024
- **Database:** tuicial_db

## Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o Docker está rodando: `docker ps`
- Verifique se o container está saudável: `docker-compose ps`
- Verifique os logs: `docker-compose logs postgres`

### Erro: "Port 5432 already in use"
- Você já tem um PostgreSQL rodando localmente
- Pare o PostgreSQL local ou mude a porta no docker-compose.yml

### Erro de conexão
- Verifique se o DATABASE_URL no .env está correto
- Aguarde alguns segundos após iniciar o Docker para o banco ficar pronto
