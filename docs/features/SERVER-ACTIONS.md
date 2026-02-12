# 🚀 Server Actions - Guia de Uso

## O que são Server Actions?

Server Actions são funções que rodam no servidor do Next.js 15. Elas substituem as rotas de API tradicionais (`/api/*`) e oferecem várias vantagens:

✅ **Mais rápidas**: Menos overhead de rede
✅ **Type-safe**: TypeScript end-to-end
✅ **Mais simples**: Menos código boilerplate
✅ **Cache automático**: Revalidação inteligente
✅ **Melhor DX**: Chamadas diretas como funções

## Estrutura

```
lib/actions/
├── index.ts          # Exportações centralizadas
├── tickets.ts        # Actions de chamados
├── users.ts          # Actions de usuários
└── notices.ts        # Actions de avisos
```

## Como Usar

### 1. Importar as Actions

```typescript
import { createTicket, getTickets, updateTicket } from '@/lib/actions'
```

### 2. Chamar no Componente

```typescript
'use client'

import { createTicket } from '@/lib/actions'
import { useState } from 'react'

export function CreateTicketForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    const result = await createTicket({
      subject: formData.get('subject') as string,
      description: formData.get('description') as string,
      urgency: formData.get('urgency') as string,
      team: 'sistemas'
    })

    if (result.success) {
      console.log('Ticket criado:', result.data)
      // Atualizar UI
    } else {
      console.error('Erro:', result.error)
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  )
}
```

### 3. Usar com useTransition (Recomendado)

```typescript
'use client'

import { createTicket } from '@/lib/actions'
import { useTransition } from 'react'

export function CreateTicketForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTicket({
        subject: formData.get('subject') as string,
        description: formData.get('description') as string,
        urgency: formData.get('urgency') as string,
        team: 'sistemas'
      })

      if (result.success) {
        // Sucesso
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <button disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Chamado'}
      </button>
    </form>
  )
}
```

## Actions Disponíveis

### Tickets (Chamados)

```typescript
// Listar chamados
const result = await getTickets()
const result = await getTickets('infra') // Filtrar por equipe

// Criar chamado
const result = await createTicket({
  subject: 'Problema no sistema',
  description: 'Descrição detalhada',
  urgency: 'high',
  category: 'Sistemas',
  service: 'Ecalc',
  team: 'sistemas'
})

// Buscar por ID
const result = await getTicketById('ticket-id')

// Atualizar chamado
const result = await updateTicket({
  id: 'ticket-id',
  status: 'Em andamento',
  assignedToId: 'user-id'
})
```

### Users (Usuários)

```typescript
// Listar usuários
const result = await getUsers()
const result = await getUsers({ search: 'jackson', team: 'infra' })

// Criar usuário
const result = await createUser({
  name: 'João Silva',
  email: 'joao@empresa.com',
  username: 'joao.silva',
  password: 'senha123',
  role: 'func_sistemas',
  team: 'sistemas',
  phone: '5545999999999'
})

// Atualizar usuário
const result = await updateUser({
  id: 'user-id',
  name: 'João Silva Jr.',
  phone: '5545888888888'
})

// Deletar usuário
const result = await deleteUser('user-id')

// Buscar usuários T.I.
const result = await getTIUsers()
```

### Notices (Avisos)

```typescript
// Listar avisos (filtra por permissão)
const result = await getNotices()

// Listar todos (apenas T.I.)
const result = await getAllNotices()

// Criar aviso
const result = await createNotice({
  title: 'Manutenção Programada',
  content: 'Sistema ficará offline das 22h às 23h',
  type: 'warning',
  targetAudience: 'all',
  expiresAt: new Date('2026-02-15')
})

// Atualizar aviso
const result = await updateNotice({
  id: 'notice-id',
  isActive: false
})

// Deletar aviso
const result = await deleteNotice('notice-id')
```

## Padrão de Resposta

Todas as actions retornam um objeto com:

```typescript
{
  success: boolean
  data?: any      // Dados em caso de sucesso
  error?: string  // Mensagem de erro
}
```

## Tratamento de Erros

```typescript
const result = await createTicket(data)

if (!result.success) {
  // Mostrar erro para o usuário
  toast.error(result.error)
  return
}

// Sucesso
toast.success('Ticket criado!')
console.log(result.data)
```

## Revalidação de Cache

As Server Actions já incluem `revalidatePath()` para atualizar o cache automaticamente:

```typescript
// Após criar um ticket
revalidatePath('/tickets')
revalidatePath('/ti/kanban')

// Após criar um aviso
revalidatePath('/')
revalidatePath('/avisos')
```

## Vantagens sobre API Routes

| Aspecto | API Routes | Server Actions |
|---------|-----------|----------------|
| Performance | Boa | Melhor (menos overhead) |
| Type Safety | Manual | Automático |
| Código | Mais verboso | Mais conciso |
| Cache | Manual | Automático |
| Revalidação | Manual | Integrada |
| DX | Bom | Excelente |

## Migração Gradual

Você pode usar Server Actions e API Routes juntos:

1. Mantenha as rotas de API existentes
2. Crie Server Actions para novas features
3. Migre rotas antigas gradualmente
4. Remova rotas de API quando não forem mais usadas

## Exemplo Completo

```typescript
'use client'

import { createTicket } from '@/lib/actions'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function QuickTicketForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createTicket({
        subject: formData.get('subject') as string,
        description: formData.get('description') as string,
        urgency: 'medium',
        team: 'sistemas'
      })

      if (result.success) {
        toast.success(`Ticket #${result.data.number} criado!`)
        e.currentTarget.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="subject"
        placeholder="Assunto"
        required
        disabled={isPending}
      />
      <textarea
        name="description"
        placeholder="Descrição"
        required
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Ticket'}
      </button>
    </form>
  )
}
```

## Próximos Passos

1. ✅ Server Actions criadas
2. ⏳ Atualizar componentes para usar Server Actions
3. ⏳ Testar todas as funcionalidades
4. ⏳ Remover rotas de API antigas (opcional)

---

**Documentação**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
