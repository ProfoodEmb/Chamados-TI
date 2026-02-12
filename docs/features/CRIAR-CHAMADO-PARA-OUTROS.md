# 👥 Criar Chamado em Nome de Outros Usuários

**Data**: 12/02/2026  
**Status**: ✅ Implementado

## 🎯 Objetivo

Permitir que líderes (lider_infra, lider_sistemas) e admins possam criar chamados em nome de outros usuários, especialmente para diretores que não usam o sistema diretamente. Isso garante que as métricas de trabalho da T.I. sejam mantidas mesmo para chamados feitos por telefone ou pessoalmente.

## ✨ Funcionalidade

### Para Líderes e Admins

Quando um líder ou admin clica em "Novo Chamado", o sistema:

1. **Mostra seletor de usuário** - Primeiro passo é escolher para quem está criando o chamado
2. **Opções disponíveis**:
   - "Para mim mesmo" - Cria o chamado em nome do próprio líder
   - Lista de usuários ativos (role: user) - Cria em nome do usuário selecionado
3. **Confirmação visual** - Mostra mensagem confirmando para quem o chamado será criado
4. **Fluxo normal** - Após selecionar, segue o fluxo normal de criação de chamado

### Para Usuários Comuns

O fluxo permanece inalterado - criam chamados apenas em seu próprio nome.

## 🔧 Implementação Técnica

### 1. API de Tickets (`app/api/tickets/route.ts`)

```typescript
// Aceita requesterId opcional no body
const { subject, description, category, urgency, service, anydesk, patrimonio, team, requesterId } = body

// Determina o solicitante
let finalRequesterId = session.user.id
const userRole = session.user.role || "user"

if (requesterId && (userRole.includes("lider") || userRole === "admin")) {
  // Verifica se o usuário existe
  const requesterExists = await prisma.user.findUnique({
    where: { id: requesterId }
  })
  
  if (requesterExists) {
    finalRequesterId = requesterId
    console.log(`📝 [Líder] Criando chamado em nome de: ${requesterExists.name}`)
  }
}

// Usa finalRequesterId ao criar o ticket
requesterId: finalRequesterId
```

### 2. Header (`components/layouts/header.tsx`)

```typescript
// Estado para armazenar o usuário selecionado
const [selectedRequesterId, setSelectedRequesterId] = useState<string>("")

// Verifica se é líder
const isLeader = user?.role?.includes("lider") || user?.role === "admin"

// Adiciona requesterId ao body das requisições
if (selectedRequesterId && selectedRequesterId !== "self") {
  requestBody.requesterId = selectedRequesterId
}

// Limpa o estado após criar o chamado
setSelectedRequesterId("")
```

### 3. Select Sector Dialog (`components/features/tickets/select-sector-dialog.tsx`)

```typescript
// Props adicionadas
interface SelectSectorDialogProps {
  // ... props existentes
  userRole?: string
  onSelectRequester?: (requesterId: string) => void
}

// Estado para gerenciar seleção
const [showRequesterSelect, setShowRequesterSelect] = useState(false)
const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
const [selectedRequesterId, setSelectedRequesterId] = useState<string>("")

// Busca usuários quando abre (apenas para líderes)
useEffect(() => {
  if (open && isLeader) {
    fetchUsers()
    setShowRequesterSelect(true)
  }
}, [open, isLeader])

// Filtra apenas usuários ativos e não-TI
const filteredUsers = data.users.filter((u: any) => 
  u.status === 'ativo' && 
  u.role === 'user'
)
```

## 📋 Fluxo de Uso

### Cenário 1: Líder cria chamado para diretor

1. Líder clica em "Novo Chamado"
2. Dialog abre mostrando "Criar Chamado Para"
3. Líder seleciona o diretor da lista
4. Confirmação: "Chamado será criado em nome de [Nome do Diretor]"
5. Líder seleciona setor (Infra/Sistemas)
6. Preenche formulário normalmente
7. Chamado é criado com `requesterId` do diretor
8. Diretor pode ver e acompanhar o chamado em sua conta

### Cenário 2: Líder cria chamado para si mesmo

1. Líder clica em "Novo Chamado"
2. Seleciona "Para mim mesmo"
3. Fluxo normal de criação

### Cenário 3: Usuário comum

1. Usuário clica em "Novo Chamado"
2. Não vê seletor de usuário
3. Fluxo normal - chamado criado em seu nome

## 🔐 Segurança

- ✅ Apenas líderes e admins podem criar chamados para outros
- ✅ Validação no backend verifica role antes de aceitar requesterId
- ✅ Verifica se o usuário solicitante existe no banco
- ✅ Usuários comuns não têm acesso à funcionalidade

## 📊 Benefícios

1. **Métricas Precisas** - Todos os chamados ficam registrados, mesmo os feitos por telefone
2. **Rastreabilidade** - Cada chamado tem um solicitante real no sistema
3. **Histórico Completo** - Diretores podem ver seus chamados mesmo sem usar o sistema
4. **Flexibilidade** - Líderes podem atender demandas urgentes rapidamente

## 🎨 UI/UX

- Seletor de usuário com busca
- Confirmação visual clara
- Ícones intuitivos (User, CheckCircle2)
- Cores de feedback (verde para confirmação)
- Loading state durante busca de usuários

## 📝 Logs

O sistema registra quando um líder cria chamado para outro usuário:

```
📝 [Líder] Criando chamado em nome de: João Silva
```

## ✅ Checklist de Implementação

- [x] API aceita requesterId opcional
- [x] Validação de permissão no backend
- [x] Busca de usuários ativos
- [x] Seletor de usuário no dialog
- [x] Confirmação visual
- [x] Integração com todos os formulários (Infra, Sistemas, Relatórios)
- [x] Limpeza de estado após criação
- [x] Logs para auditoria
- [x] Testes de permissão

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar filtro por setor no seletor de usuários
- [ ] Histórico de chamados criados por líderes
- [ ] Notificação ao usuário quando líder cria chamado para ele
- [ ] Relatório de chamados criados por terceiros

## 📖 Documentação Relacionada

- [Estrutura de Permissões](../architecture/SECURITY-AUDIT.md)
- [API de Tickets](../architecture/PROJECT_STRUCTURE.md)
- [Gerenciamento de Usuários](./USERS-MANAGEMENT.md)
