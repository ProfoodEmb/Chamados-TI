# 🚀 Deploy no Ubuntu Server - Sistema de Chamados

## 📊 Requisitos de Hardware (100 Usuários)

### Configuração Recomendada
```
CPU: 4 cores (mínimo 2 cores)
RAM: 8 GB (mínimo 4 GB)
Disco: 50 GB SSD (mínimo 20 GB)
Rede: 100 Mbps
```

### Por que essas especificações?
- **CPU**: Next.js precisa processar requisições, 4 cores garante boa performance
- **RAM**: 8 GB permite rodar Node.js, PostgreSQL e sistema operacional confortavelmente
- **SSD**: Melhora drasticamente a velocidade de leitura/escrita do banco de dados
- **Rede**: 100 usuários com polling a cada 3s = ~33 req/s (tranquilo para 100 Mbps)

### Configuração Mínima (Funcional mas mais lenta)
```
CPU: 2 cores
RAM: 4 GB
Disco: 20 GB
```

## 🛠️ Software Necessário

### 1. Sistema Operacional
```bash
Ubuntu Server 22.04 LTS ou 24.04 LTS (recomendado)
```

### 2. Stack de Software
- Node.js 20.x ou superior
- PostgreSQL 15 ou superior
- PM2 (gerenciador de processos)
- Nginx (proxy reverso)
- Git

## 📦 Instalação Passo a Passo

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20.x
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### 3. Instalar PostgreSQL
```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### 4. Configurar PostgreSQL
```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Dentro do PostgreSQL, executar:
CREATE DATABASE chamados;
CREATE USER chamados_user WITH PASSWORD 'sua_senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE chamados TO chamados_user;
\q
```

### 5. Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar com o sistema
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 6. Instalar Nginx
```bash
sudo apt install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. Instalar Git
```bash
sudo apt install -y git
```

## 📁 Deploy da Aplicação

### 1. Criar Usuário para a Aplicação
```bash
# Criar usuário (opcional mas recomendado)
sudo adduser chamados
sudo usermod -aG sudo chamados

# Trocar para o usuário
su - chamados
```

### 2. Clonar Repositório
```bash
# Ir para o diretório home
cd ~

# Clonar o projeto (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/sistema-chamados.git
cd sistema-chamados
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

**Configurar as seguintes variáveis:**
```env
# Database
DATABASE_URL="postgresql://chamados_user:sua_senha_forte_aqui@localhost:5432/chamados"

# Better Auth
BETTER_AUTH_SECRET="gere_uma_chave_secreta_aleatoria_aqui"
BETTER_AUTH_URL="http://seu-ip-ou-dominio:3000"

# WhatsApp (Evolution API)
EVOLUTION_API_URL="sua_url_evolution_api"
EVOLUTION_API_KEY="sua_chave_api"
EVOLUTION_INSTANCE="sua_instancia"

# Equipes (números de WhatsApp)
SISTEMAS_TEAM_PHONE="5511999999999"
INFRA_TEAM_PHONE="5511888888888"
```

**Gerar chave secreta:**
```bash
# Gerar chave aleatória
openssl rand -base64 32
```

### 5. Configurar Banco de Dados
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# (Opcional) Popular banco com dados iniciais
npm run db:seed
```

### 6. Build da Aplicação
```bash
# Build de produção
npm run build
```

### 7. Iniciar com PM2
```bash
# Iniciar aplicação
pm2 start npm --name "chamados" -- start

# Salvar configuração do PM2
pm2 save

# Ver logs
pm2 logs chamados

# Ver status
pm2 status
```

## 🌐 Configurar Nginx (Proxy Reverso)

### 1. Criar Configuração do Nginx
```bash
sudo nano /etc/nginx/sites-available/chamados
```

**Adicionar configuração:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;  # ou IP do servidor

    # Aumentar tamanho máximo de upload (para anexos)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout para SSE/Polling
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### 2. Ativar Site
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/chamados /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 🔒 Configurar SSL (HTTPS) - Opcional mas Recomendado

### Usando Certbot (Let's Encrypt - Grátis)
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com.br

# Renovação automática já está configurada
```

## 🔥 Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable

# Ver status
sudo ufw status
```

## 📊 Monitoramento e Manutenção

### Comandos Úteis do PM2
```bash
# Ver logs em tempo real
pm2 logs chamados

# Ver logs de erro
pm2 logs chamados --err

# Reiniciar aplicação
pm2 restart chamados

# Parar aplicação
pm2 stop chamados

# Ver uso de recursos
pm2 monit

# Ver informações detalhadas
pm2 info chamados
```

### Backup do Banco de Dados
```bash
# Criar backup
pg_dump -U chamados_user chamados > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U chamados_user chamados < backup_20260211.sql
```

### Script de Backup Automático
```bash
# Criar script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/chamados/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U chamados_user chamados > $BACKUP_DIR/backup_$DATE.sql
# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Dar permissão
chmod +x ~/backup-db.sh

# Adicionar ao crontab (backup diário às 2h)
crontab -e
# Adicionar linha:
0 2 * * * /home/chamados/backup-db.sh
```

## 🔄 Atualizar Aplicação

```bash
# Ir para o diretório
cd ~/sistema-chamados

# Puxar atualizações
git pull

# Instalar novas dependências
npm install

# Executar migrations (se houver)
npx prisma migrate deploy

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart chamados
```

## 📈 Otimizações para Performance

### 1. Configurar PostgreSQL para Produção
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

**Ajustar parâmetros (para 8GB RAM):**
```conf
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 200
```

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 2. Configurar PM2 para Cluster Mode
```bash
# Parar aplicação atual
pm2 delete chamados

# Iniciar em cluster mode (usa todos os cores)
pm2 start npm --name "chamados" -i max -- start

# Salvar
pm2 save
```

## 🎯 Checklist Final

- [ ] Ubuntu Server instalado e atualizado
- [ ] Node.js 20.x instalado
- [ ] PostgreSQL instalado e configurado
- [ ] Banco de dados criado e migrations executadas
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação buildada com sucesso
- [ ] PM2 configurado e aplicação rodando
- [ ] Nginx configurado como proxy reverso
- [ ] SSL/HTTPS configurado (recomendado)
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Testado acesso via navegador

## 🆘 Troubleshooting

### Aplicação não inicia
```bash
# Ver logs de erro
pm2 logs chamados --err

# Verificar se a porta 3000 está livre
sudo netstat -tulpn | grep 3000
```

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U chamados_user -d chamados -h localhost
```

### Nginx retorna 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
pm2 status

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📞 Suporte

Para problemas específicos, verifique os logs:
- Aplicação: `pm2 logs chamados`
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- PostgreSQL: `sudo tail -f /var/log/postgresql/postgresql-15-main.log`
