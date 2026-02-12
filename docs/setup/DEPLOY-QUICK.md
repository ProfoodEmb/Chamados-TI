# ⚡ Deploy Rápido - Ubuntu Server

## 📊 Requisitos Mínimos (100 Usuários)

```
✅ CPU: 4 cores
✅ RAM: 8 GB
✅ Disco: 50 GB SSD
✅ Ubuntu Server 22.04 LTS ou superior
```

## 🚀 Instalação Rápida

### 1. Instalar Dependências
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# PM2 e Nginx
sudo npm install -g pm2
sudo apt install -y nginx git
```

### 2. Configurar PostgreSQL
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE chamados;
CREATE USER chamados_user WITH PASSWORD 'SuaSenhaForte123!';
GRANT ALL PRIVILEGES ON DATABASE chamados TO chamados_user;
\q
```

### 3. Deploy da Aplicação
```bash
# Clonar projeto
cd ~
git clone https://github.com/seu-usuario/sistema-chamados.git
cd sistema-chamados

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env  # Editar com suas configurações

# Setup banco de dados
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "chamados" -i max -- start
pm2 save
pm2 startup
```

### 4. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/chamados
```

```nginx
server {
    listen 80;
    server_name seu-ip-ou-dominio;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/chamados /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## ✅ Pronto!

Acesse: `http://seu-ip-ou-dominio`

## 📝 Comandos Úteis

```bash
# Ver logs
pm2 logs chamados

# Reiniciar
pm2 restart chamados

# Status
pm2 status

# Backup banco
pg_dump -U chamados_user chamados > backup.sql

# Atualizar aplicação
cd ~/sistema-chamados
git pull
npm install
npm run build
pm2 restart chamados
```

## 🔒 SSL (Opcional)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com.br
```

---

📖 **Guia completo:** Veja `DEPLOY-UBUNTU.md` para instruções detalhadas
