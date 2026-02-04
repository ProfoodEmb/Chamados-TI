# Sistema de Tempo Real - Chamados

## Visão Geral

O sistema implementa uma solução de tempo real baseada em **polling inteligente** que verifica automaticamente por atualizações em intervalos regulares e quando a janela ganha foco.

## Credenciais de Login

### Usuários T.I.
- **admin / admin123** - Vinicius Mathues (Gestor)
- **lider_infra / lider123** - Jackson Felipe (Líder Infra)
- **func_infra / func1234** - Gustavo Americano (Funcionário Infra)
- **lider_sistemas / lider123** - Antony Gouvea (Líder Sistemas)
- **func_sistemas / func1234** - Danilo Oliveira (Funcionário Sistemas)

### Usuário Comum
- **usuario / usuario123** - Usuário Comum

## Como Funciona o Sistema de Tempo Real

### Sistema de Polling Inteligente

#### Para Listas de Chamados
- **Intervalo**: 8-10 segundos (dependendo da página)
- **Detecção de Mudanças**: Compara número de tickets para detectar alterações
- **Triggers Automáticos**: 
  - Foco da janela (quando você volta para a aba)
  - Mudança de visibilidade da página
  - Intervalo regular configurado
- **Atualização Manual**: Botão "Atualizar" sempre disponível

#### Para Chat de Mensagens
- **Intervalo**: 5 segundos (mais rápido para conversas)
- **Detecção de Mudanças**: Compara número de mensagens do ticket
- **Triggers Automáticos**: 
  - Foco da janela (quando você volta para a aba)
  - Mudança de visibilidade da página
  - Intervalo regular de 5 segundos
- **Atualização Manual**: Botão "Atualizar" no cabeçalho do chat
- **Indicador Visual**: Mostra status do polling no topo da página de chat

### Intervalos por Página
- **Home**: 10 segundos
- **Dashboard T.I.**: 8 segundos  
- **Kanban**: 8 segundos
- **Chat de Ticket**: 5 segundos (mais rápido para conversas)

## Indicadores Visuais

### Status de Conexão
- 🟢 **Polling (8s)** - Sistema ativo, verificando a cada 8 segundos
- 🟢 **Polling (10s)** - Sistema ativo, verificando a cada 10 segundos
- 🔴 **Desconectado** - Sistema inativo

### Informações Exibidas
- Intervalo de polling atual
- Tempo desde última atualização
- Botão de atualização manual

## Eventos Monitorados

### Criação de Chamados
- Sistema detecta automaticamente novos chamados
- Atualiza todas as páginas quando detecta mudança
- Logs no console mostram detecção: "Mudança detectada via polling"

### Atualização de Chamados
- Mudanças de status no Kanban são detectadas
- Atribuição de responsáveis
- Qualquer alteração que mude o número total de tickets

### Chat de Mensagens (NOVO!)
- **Detecção Automática**: Novas mensagens aparecem automaticamente
- **Polling Rápido**: Verifica a cada 5 segundos
- **Atualização Imediata**: Ao focar na janela do chat
- **Indicador Visual**: Status do polling no topo da página
- **Logs Específicos**: "Nova mensagem detectada via polling"
- **Upload de Arquivos**: Botão de clipe (📎) funcional para anexar imagens e documentos

### Drag & Drop no Kanban
- Atualiza status em tempo real
- Sincroniza com banco de dados
- Próxima verificação de polling detecta a mudança

## Como Testar

### Teste de Criação de Chamados
1. **Abra duas abas/janelas** do sistema
2. **Crie um chamado** em uma aba
3. **Aguarde até 10 segundos** - o chamado deve aparecer na outra aba automaticamente
4. **Mude o foco** para a outra aba - atualização imediata
5. **Use o botão "Atualizar"** - força atualização manual

### Teste de Chat em Tempo Real (NOVO!)
1. **Abra um chamado** em duas abas/janelas diferentes
2. **Envie uma mensagem** em uma aba
3. **Aguarde até 5 segundos** - a mensagem deve aparecer na outra aba
4. **Mude o foco** para a outra aba - atualização imediata
5. **Observe o indicador** no topo: "Polling (5s)" mostra que está ativo
6. **Use o botão "Atualizar"** no cabeçalho do chat para forçar atualização

### Teste de Upload de Arquivos (NOVO!)
1. **Abra um chamado** 
2. **Clique no botão de clipe (📎)** no campo de mensagem
3. **Selecione um arquivo** (imagem, PDF, Word, Excel, TXT)
4. **Aguarde o upload** - indicador mostra progresso
5. **Arquivo aparece** na seção "Anexos" do chat
6. **Clique no botão de download** para baixar o arquivo

## Logs de Debug

O sistema gera logs detalhados no console:

### Para Listas de Chamados:
- 🔄 "Iniciando sistema de polling simples..."
- 🔍 "Verificando atualizações via polling..."
- 📢 "Mudança detectada via polling: {anterior: X, atual: Y}"
- 👁️ "Janela focada - verificando atualizações"
- 🔄 "Atualização forçada via polling"

### Para Chat de Mensagens (NOVO!):
- 💬 "Iniciando polling de mensagens para ticket: [ID]"
- 🔍 "Verificando mensagens do ticket via polling..."
- 💬 "Nova mensagem detectada via polling: {anterior: X, atual: Y}"
- 👁️ "Janela focada - verificando mensagens"
- 🔄 "Atualização forçada de mensagens"

## Vantagens do Sistema Atual

✅ **Simplicidade**: Sem complexidade de WebSockets  
✅ **Confiabilidade**: Funciona sempre, sem timeouts  
✅ **Eficiência**: Só atualiza quando detecta mudanças  
✅ **Responsividade**: Atualização imediata ao focar janela  
✅ **Controle**: Botão manual sempre disponível  
✅ **Debug**: Logs claros para troubleshooting  
✅ **Chat em Tempo Real**: Mensagens aparecem automaticamente em 5s  
✅ **Indicadores Visuais**: Status claro em todas as páginas  
✅ **Upload de Arquivos**: Botão de clipe funcional para anexos (NOVO!)  
✅ **Tipos de Arquivo**: Imagens, PDF, Word, Excel, TXT (máx. 10MB) (NOVO!)  
✅ **Visualização de Anexos**: Lista organizada com download (NOVO!)  

## Arquivos Principais

- `lib/use-simple-polling.ts` - Sistema de polling para listas
- `lib/use-ticket-polling.ts` - Sistema de polling para chat (NOVO!)
- `app/page.tsx` - Home com polling de 10s
- `app/ti/page.tsx` - Dashboard T.I. com polling de 8s  
- `app/ti/kanban/page.tsx` - Kanban com polling de 8s
- `app/tickets/[id]/page.tsx` - Chat com polling de 5s (NOVO!)
- `app/api/tickets/route.ts` - API que detecta mudanças em listas
- `app/api/tickets/[id]/messages/route.ts` - API que detecta novas mensagens (NOVO!)
- `app/api/tickets/[id]/attachments/route.ts` - API para upload de arquivos (NOVO!)
- `components/ticket-detail.tsx` - Componente de chat com upload (NOVO!)