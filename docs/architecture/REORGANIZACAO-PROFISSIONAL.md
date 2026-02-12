# 🏗️ Plano de Reorganização Profissional

## 📊 Análise da Estrutura Atual

### ✅ Pontos Positivos
- Componentes já organizados por features
- Lib com subpastas (api, auth, db, hooks)
- Scripts separados em db/ e dev/
- Types centralizados

### ⚠️ Problemas Identificados

1. **Raiz do Projeto Poluída**
   - 30+ arquivos .md na raiz
   - Arquivos de banco antigos (dev.db, sqlite-export.json)
   - Scripts PowerShell soltos (.ps1)
   - Pasta `pages/` obsoleta (Next.js 13+ usa apenas `app/`)

2. **Lib Desorganizada**
   - Hooks duplicados na raiz e em `lib/hooks/`
   - Arquivos soltos: `users.ts`, `utils.ts`, `mock-tickets.ts`
   - Pasta `lib/utils/` vazia

3. **Scripts Duplicados**
   - `clear-tickets.js` e `clear-tickets.ts` na raiz de scripts/
   - Muitos scripts de teste que poderiam estar melhor organizados

4. **Assets Mal Organizados**
   - Arquivos em `assets/sistemas/` deveriam estar em `public/`
   - Estrutura confusa com subpastas

## 🎯 Estrutura Profissional Proposta

```
chamados/
├── .github/                          # CI/CD workflows
├── .vscode/                          # Configurações do VS Code
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Grupo de rotas de autenticação
│   │   └── login/
│   ├── (dashboard)/                  # Grupo de rotas do dashboard
│   │   ├── page.tsx                  # Home
│   │   ├── tickets/
│   │   ├── avisos/
│   │   └── criar-aviso/
│   ├── (admin)/                      # Grupo de rotas admin
│   │   └── ti/
│   ├── api/                          # API Routes
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── features/                     # ✅ Já está bom
│   ├── layouts/                      # ✅ Já está bom
│   ├── shared/                       # ✅ Já está bom
│   └── ui/                           # ✅ Já está bom
├── lib/
│   ├── actions/                      # Server Actions
│   ├── api/                          # API utilities
│   ├── auth/                         # Autenticação
│   ├── db/                           # Database
│   ├── hooks/                        # React Hooks (consolidado)
│   ├── utils/                        # Utilitários gerais
│   ├── constants/                    # Constantes
│   └── types/                        # Types específicos (além de types/)
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/                           # Assets estáticos
│   ├── images/
│   │   ├── sistemas/
│   │   ├── perfil/
│   │   └── equipamentos/
│   └── uploads/
├── scripts/
│   ├── db/                           # Scripts de banco
│   ├── dev/                          # Scripts de desenvolvimento
│   └── deploy/                       # Scripts de deploy
├── types/                            # Types globais
├── docs/                             # 📚 NOVA: Documentação
│   ├── setup/
│   ├── features/
│   ├── deployment/
│   └── changelog/
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── next.config.ts
├── package.json
├── README.md                         # README principal
└── tsconfig.json
```

## 🔄 Mudanças Específicas

### 1. Mover Documentação
```
Criar: docs/
├── setup/
│   ├── whatsapp.md
│   ├── webhook.md
│   ├── postgresql.md
│   └── deploy.md
├── features/
│   ├── realtime.md
│   ├── kanban.md
│   └── server-actions.md
├── architecture/
│   ├── design-system.md
│   ├── project-structure.md
│   └── security.md
└── changelog/
    └── 2026-02-11.md
```

### 2. Consolidar Hooks
```
Mover todos para lib/hooks/:
- use-ticket-polling.ts
- use-notices-polling.ts
- use-simple-polling.ts
- use-simple-realtime.ts
- use-socket-realtime.ts
```

### 3. Organizar Utils
```
lib/utils/
├── cn.ts                    # Tailwind merge
├── format.ts                # Formatação (datas, telefones)
├── validation.ts            # Validações
└── index.ts                 # Exports
```

### 4. Limpar Raiz
```
Remover:
- dev.db
- sqlite-export.json
- *.ps1 (mover para scripts/dev/)
- Todos os .md (mover para docs/)

Manter apenas:
- .env
- .env.example
- .gitignore
- docker-compose.yml
- middleware.ts
- next.config.ts
- package.json
- README.md
- tsconfig.json
- components.json
- postcss.config.mjs
- eslint.config.mjs
```

### 5. Remover Obsoletos
```
Deletar:
- pages/ (obsoleto no Next.js 13+)
- prisma/dev.db (usar PostgreSQL)
```

### 6. Organizar Public
```
public/
├── images/
│   ├── sistemas/           # Logos de sistemas
│   ├── perfil/             # Fotos de perfil
│   └── equipamentos/       # Fotos de equipamentos
├── uploads/                # Uploads de usuários
└── icons/                  # Ícones e favicons
```

### 7. Agrupar Rotas no App
```
app/
├── (auth)/                 # Layout de autenticação
│   └── login/
├── (dashboard)/            # Layout do dashboard
│   ├── page.tsx
│   ├── tickets/
│   ├── avisos/
│   └── criar-aviso/
└── (admin)/                # Layout admin
    └── ti/
```

## 📋 Checklist de Execução

### Fase 1: Documentação
- [ ] Criar pasta `docs/`
- [ ] Mover todos os .md para subpastas apropriadas
- [ ] Atualizar README.md principal
- [ ] Criar índice de documentação

### Fase 2: Lib
- [ ] Consolidar hooks em `lib/hooks/`
- [ ] Organizar utils em `lib/utils/`
- [ ] Mover `users.ts` para `lib/utils/users.ts`
- [ ] Remover `mock-tickets.ts` (se não usado)

### Fase 3: Public
- [ ] Mover assets de `assets/` para `public/images/`
- [ ] Reorganizar estrutura de imagens
- [ ] Deletar pasta `assets/`

### Fase 4: Scripts
- [ ] Consolidar scripts duplicados
- [ ] Criar pasta `scripts/deploy/`
- [ ] Mover .ps1 para `scripts/dev/`

### Fase 5: Limpeza
- [ ] Remover `pages/`
- [ ] Remover arquivos de banco antigos
- [ ] Limpar raiz do projeto

### Fase 6: App Router (Opcional)
- [ ] Criar grupos de rotas (auth), (dashboard), (admin)
- [ ] Mover rotas para grupos apropriados

## 🎯 Benefícios

1. **Raiz Limpa**: Apenas arquivos de configuração essenciais
2. **Documentação Organizada**: Fácil de encontrar e manter
3. **Lib Consistente**: Tudo no lugar certo
4. **Melhor DX**: Developer Experience aprimorada
5. **Profissional**: Estrutura que qualquer dev entende
6. **Escalável**: Fácil adicionar novas features

## ⚠️ Cuidados

1. Atualizar imports após mover arquivos
2. Testar build após cada fase
3. Fazer commit entre fases
4. Manter backup antes de começar

## 🚀 Próximos Passos

Deseja que eu execute essa reorganização?
