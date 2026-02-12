# Plano de Reorganização do Projeto

## Problemas Críticos Identificados

### 1. "use client" no Layout Raiz ❌ CRÍTICO
- **Problema**: `app/layout.tsx` tem "use client" forçando toda aplicação a ser client-side
- **Impacto**: Perda de benefícios do Server Components, SEO ruim, performance degradada
- **Solução**: Remover "use client" e extrair lógica client-side para componentes separados

### 2. Mistura de Pages Router e App Router
- **Problema**: Pasta `pages/api/` coexistindo com `app/api/`
- **Solução**: Remover `pages/api/` completamente (não está sendo usado)

### 3. Arquivos Não Utilizados
- `components/create-ticket-dialog.tsx.backup` - arquivo de backup
- 40+ scripts de teste temporários em `scripts/`
- Fontes importadas mas não usadas no layout

### 4. Estrutura de Componentes Desorganizada
- Todos os 30+ componentes em uma pasta plana
- Sem separação entre features, shared, layouts

### 5. Hooks Duplicados/Similares
- `use-socket.ts`, `use-sse.ts`, `use-realtime.ts`, `use-simple-realtime.ts`, `use-socket-realtime.ts`
- Múltiplas implementações de polling/realtime

## Nova Estrutura Proposta

```
├── app/
│   ├── (auth)/              # Grupo de rotas de autenticação
│   │   └── login/
│   ├── (dashboard)/         # Grupo de rotas principais
│   │   ├── page.tsx
│   │   ├── tickets/
│   │   ├── avisos/
│   │   └── criar-aviso/
│   ├── (ti)/                # Grupo de rotas TI
│   │   └── ti/
│   ├── api/                 # API Routes (mantém estrutura atual)
│   ├── layout.tsx           # Server Component (SEM "use client")
│   └── globals.css
│
├── components/
│   ├── features/            # Componentes específicos de features
│   │   ├── tickets/
│   │   ├── notices/
│   │   ├── users/
│   │   ├── metrics/
│   │   └── kanban/
│   ├── layouts/             # Componentes de layout
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── providers.tsx    # Client providers
│   ├── shared/              # Componentes compartilhados
│   │   ├── dialogs/
│   │   └── toasts/
│   └── ui/                  # Componentes UI base (mantém)
│
├── lib/
│   ├── api/                 # Utilitários de API
│   ├── hooks/               # Custom hooks
│   │   ├── use-realtime.ts  # Hook principal de realtime
│   │   └── use-polling.ts   # Hook de polling
│   ├── auth/                # Autenticação
│   ├── db/                  # Database
│   └── utils/               # Utilitários gerais
│
├── scripts/
│   ├── db/                  # Scripts de database
│   └── dev/                 # Scripts de desenvolvimento (testes)
│
└── types/                   # TypeScript types globais
```

## Ações a Executar

1. ✅ Criar nova estrutura de pastas
2. ✅ Corrigir layout.tsx (remover "use client", criar providers)
3. ✅ Reorganizar componentes por feature
4. ✅ Consolidar hooks de realtime
5. ✅ Limpar scripts não utilizados
6. ✅ Remover arquivos obsoletos
7. ✅ Atualizar imports em todos os arquivos
8. ✅ Testar build

## Benefícios Esperados

- ✅ Server Components funcionando corretamente
- ✅ Melhor performance (menos JavaScript no cliente)
- ✅ Código mais organizado e manutenível
- ✅ Fácil localização de componentes
- ✅ Separação clara de responsabilidades
- ✅ Projeto escalável e profissional
