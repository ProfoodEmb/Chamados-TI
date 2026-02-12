# 📋 Sistema Kanban

Sistema de visualização automática do fluxo de tickets em formato Kanban.

## 🎯 Funcionalidades

### Visualização em Colunas (Automática)
- **Inbox**: Tickets recém-criados aguardando atendimento
- **Em Progresso**: Tickets com primeira resposta do suporte
- **Revisão**: Tickets finalizados aguardando confirmação do usuário
- **Concluído**: Tickets com feedback do usuário

### Fluxo Automático
O sistema move os tickets automaticamente baseado nas ações:

1. **Criação** → Ticket vai para **Inbox**
2. **Primeira resposta do suporte** → Move para **Em Progresso**
3. **Suporte solicita fechamento** → Move para **Revisão**
4. **Usuário confirma e avalia** → Move para **Concluído**

### Filtros Avançados
- **Busca**: Por número, assunto ou nome do solicitante
- **Equipe**: Filtrar por infra, sistemas ou automação
- **Urgência**: Filtrar por baixa, média, alta ou crítica

### Indicadores Visuais
- **Borda colorida**: Indica urgência do ticket
  - 🔴 Vermelho: Crítica
  - 🟠 Laranja: Alta
  - 🔵 Azul: Média
  - ⚪ Cinza: Baixa
- **Tempo decorrido**: Mostra há quanto tempo o ticket foi criado
- **Avatar do solicitante**: Identifica quem abriu o ticket
- **Avatar do responsável**: Mostra quem está trabalhando no ticket

## 🔄 Transições Automáticas

### 1. Inbox → Em Progresso
**Gatilho**: Primeira mensagem do suporte no chat
```
Quando: Suporte envia primeira resposta
Ação: kanbanStatus = "in_progress"
```

### 2. Em Progresso → Revisão
**Gatilho**: Suporte solicita fechamento do ticket
```
Quando: Suporte clica em "Solicitar Fechamento"
Ação: status = "Aguardando Aprovação"
      kanbanStatus = "review"
```

### 3a. Revisão → Concluído (Usuário aceita)
**Gatilho**: Usuário confirma resolução e deixa feedback
```
Quando: Usuário avalia o atendimento (1-5 estrelas)
Ação: status = "Fechado"
      kanbanStatus = "done"
      rating = [1-5]
      feedback = "comentário"
```

### 3b. Revisão → Em Progresso (Usuário nega)
**Gatilho**: Usuário informa que o problema não foi resolvido
```
Quando: Usuário clica em "Não" na confirmação
Ação: status = "Aberto"
      kanbanStatus = "in_progress"
Resultado: Ticket volta para atendimento
```

## 🚀 Como Usar

### Acessar o Kanban
1. Faça login como usuário T.I.
2. Clique no ícone de Kanban na sidebar
3. Ou acesse diretamente: `/ti/kanban`

### Visualizar Tickets
- Cada coluna mostra os tickets no respectivo estágio
- Clique em qualquer ticket para ver detalhes completos
- Use os filtros para encontrar tickets específicos

### Acompanhar Progresso
- **Inbox**: Tickets aguardando primeira resposta
- **Em Progresso**: Tickets sendo atendidos ativamente
- **Revisão**: Tickets aguardando confirmação do usuário
- **Concluído**: Tickets finalizados com sucesso

## 🛠️ Migração de Dados

Para migrar tickets existentes para o Kanban:

```bash
node scripts/migrate-kanban-status.js
```

Este script mapeia o status atual para kanbanStatus:
- Aberto → inbox
- Pendente → in_progress
- Aguardando Aprovação → review
- Resolvido/Fechado → done

## 📊 Mapeamento de Status

| Status Tradicional | kanbanStatus | Descrição |
|-------------------|--------------|-----------|
| Aberto | inbox | Aguardando atendimento |
| Pendente | in_progress | Em atendimento |
| Aguardando Aprovação | review | Aguardando usuário |
| Resolvido/Fechado | done | Finalizado |

## 🔐 Permissões

Apenas usuários T.I. têm acesso ao Kanban:
- Admin
- Líderes (Infra/Sistemas)
- Funcionários (Infra/Sistemas)

## 🔄 Tempo Real

O Kanban utiliza Socket.IO para atualizações em tempo real:
- Novos tickets aparecem automaticamente no Inbox
- Transições de status são sincronizadas instantaneamente
- Múltiplos usuários podem visualizar simultaneamente

## 📱 Responsividade

O Kanban é otimizado para desktop. Para mobile, recomenda-se usar a visualização de lista tradicional em `/tickets`.

## 💡 Dicas

- **Inbox vazio**: Todos os tickets foram atendidos
- **Muitos em Revisão**: Usuários precisam confirmar resolução
- **Concluído crescendo**: Indicador de produtividade da equipe
- Use filtros para focar em tickets específicos por equipe ou urgência
