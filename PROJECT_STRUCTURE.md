# Estrutura do Projeto - Sistema de Chamados

## 📁 Estrutura de Pastas

```
chamados/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   └── login/
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   ├── tickets/              # Endpoints de tickets
│   │   ├── notices/              # Endpoints de avisos
│   │   ├── users/                # Endpoints de usuários
│   │   └── metrics/              # Endpoints de métricas
│   ├── tickets/                  # Páginas de tickets
│   ├── avisos/                   # Páginas de avisos
│   ├── criar-aviso/              # Criar aviso
│   ├── ti/                       # Área administrativa TI
│   │   ├── kanban/
│   │   ├── metricas/
│   │   ├── equipe/
│   │   ├── usuarios/
│   │   └── avisos/
│   ├── layout.tsx                # Layout raiz (SERVER COMPONENT)
│   ├── page.tsx                  # Página inicial
│   └── globals.css               # Estilos globais
│
├── components/
│   ├── features/                 # Componentes específicos de features
│   │   ├── tickets/              # Componentes de tickets
│   │   │   ├── create-ticket-dialog.tsx
│   │   │   ├── ticket-detail.tsx
│   │   │   ├── tickets-table.tsx
│   │   │   ├── tickets-filters.tsx
│   │   │   ├── assign-ticket-dialog.tsx
│   │   │   ├── close-ticket-dialog.tsx
│   │   │   └── ...
│   │   ├── notices/              # Componentes de avisos
│   │   │   ├── notice-board.tsx
│   │   │   └── create-notice-dialog.tsx
│   │   ├── users/                # Componentes de usuários
│   │   │   ├── users-management.tsx
│   │   │   ├── create-user-dialog.tsx
│   │   │   ├── edit-user-dialog.tsx
│   │   │   └── user-profile-dialog.tsx
│   │   ├── metrics/              # Componentes de métricas
│   │   │   └── metrics-dashboard.tsx
│   │   └── kanban/               # Componentes do kanban
│   │       └── kanban-board.tsx
│   ├── layouts/                  # Componentes de layout
│   │   ├── header.tsx            # Header (client component)
│   │   ├── sidebar.tsx           # Sidebar (client component)
│   │   ├── dashboard-layout.tsx  # Layout do dashboard
│   │   └── providers.tsx         # Client providers
│   ├── shared/                   # Componentes compartilhados
│   │   ├── dialogs/              # Diálogos genéricos
│   │   │   └── confirm-dialog.tsx
│   │   ├── toasts/               # Notificações toast
│   │   │   ├── simple-toast.tsx
│   │   │   └── notice-toast.tsx
│   │   ├── realtime-indicator.tsx
│   │   ├── realtime-notifications.tsx
│   │   ├── socket-debug.tsx
│   │   └── help-center.tsx
│   └── ui/                       # Componentes UI base (shadcn/ui)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/
│   ├── api/                      # Utilitários de API
│   │   ├── socket-server.ts      # Configuração Socket.IO
│   │   └── webhook-notifications.ts
│   ├── auth/                     # Autenticação
│   │   ├── auth.ts               # Better Auth config
│   │   └── auth-client.ts        # Cliente de autenticação
│   ├── db/                       # Database
│   │   └── prisma.ts             # Cliente Prisma
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-realtime.ts       # Hook principal de realtime
│   │   └── use-socket.ts         # Hook do Socket.IO
│   ├── mock-tickets.ts           # Dados mock (dev)
│   ├── users.ts                  # Utilitários de usuários
│   └── utils.ts                  # Utilitários gerais
│
├── prisma/
│   ├── schema.prisma             # Schema do banco de dados
│   └── seed.ts                   # Seed do banco
│
├── scripts/
│   ├── db/                       # Scripts de database
│   │   ├── migrate-kanban-status.js
│   │   ├── fix-ticket-numbers.js
│   │   └── delete-all-tickets.js
│   └── dev/                      # Scripts de desenvolvimento/teste
│       ├── test-*.js
│       ├── check-*.js
│       ├── create-*.js
│       └── debug-*.js
│
├── types/
│   └── index.ts                  # TypeScript types globais
│
├── assets/                       # Assets estáticos
│   └── sistemas/                 # Logos de sistemas
│
└── [arquivos de configuração]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── .env
    └── ...
```

## 🎯 Princípios de Organização

### 1. Server Components por Padrão
- **Layout raiz (`app/layout.tsx`)**: Server Component (SEM "use client")
- **Páginas**: Server Components quando possível
- **Client Components**: Apenas quando necessário (interatividade, hooks, eventos)

### 2. Separação por Feature
- Componentes organizados por funcionalidade (tickets, notices, users, etc.)
- Facilita localização e manutenção
- Evita pasta plana com 30+ arquivos

### 3. Componentes Compartilhados
- `components/shared/`: Componentes usados em múltiplas features
- `components/ui/`: Componentes UI base (shadcn/ui)
- `components/layouts/`: Componentes de layout

### 4. Lib Organizada
- `lib/api/`: Lógica de API e comunicação
- `lib/auth/`: Autenticação
- `lib/db/`: Database
- `lib/hooks/`: Custom hooks React

### 5. Scripts Separados
- `scripts/db/`: Scripts de produção/migração
- `scripts/dev/`: Scripts de teste e desenvolvimento

## 🔧 Mudanças Principais

### ✅ Corrigido: Layout Raiz
**Antes:**
```tsx
"use client"  // ❌ Forçava toda app a ser client-side

export default function RootLayout({ children }) {
  const pathname = usePathname()  // Hook do cliente
  // ...
}
```

**Depois:**
```tsx
// ✅ Server Component por padrão

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>  {/* Client providers isolados */}
          <DashboardLayout>  {/* Lógica client isolada */}
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  )
}
```

### ✅ Removido: Arquivos Obsoletos
- ❌ `pages/api/` (Pages Router antigo)
- ❌ `components/create-ticket-dialog.tsx.backup`
- ❌ Fontes não utilizadas (Geist, GeistMono)

### ✅ Reorganizado: Componentes
- 30+ componentes movidos para estrutura organizada
- Imports atualizados automaticamente via `smartRelocate`

### ✅ Reorganizado: Scripts
- Scripts de teste movidos para `scripts/dev/`
- Scripts de DB movidos para `scripts/db/`

## 📚 Benefícios

1. **Performance**: Server Components reduzem JavaScript no cliente
2. **SEO**: Melhor renderização server-side
3. **Manutenibilidade**: Código organizado e fácil de encontrar
4. **Escalabilidade**: Estrutura preparada para crescimento
5. **Profissionalismo**: Segue best practices do Next.js 14+

## 🚀 Próximos Passos

1. Testar build: `npm run build`
2. Verificar se todas as páginas funcionam
3. Confirmar que realtime/websockets funcionam
4. Deploy em produção

## 📖 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
