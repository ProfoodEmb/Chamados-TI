// Sistema de notificações via WhatsApp usando Evolution API
// Envia mensagens automáticas quando chamados são criados ou atualizados

interface TicketData {
  id: string
  number: string
  subject: string
  description?: string
  category: string
  urgency: string
  status: string
  team?: string | null
  service?: string | null
  createdAt: string
  requester: {
    id: string
    name: string
    email: string
    phone?: string | null
  }
  assignedTo?: {
    id: string
    name: string
    email: string
    phone?: string | null
  } | null
}

interface EvolutionConfig {
  apiUrl: string
  instanceName: string
  apiKey: string
  enabled: boolean
}

// Configuração da Evolution API
const EVOLUTION_CONFIG: EvolutionConfig = {
  apiUrl: process.env.EVOLUTION_API_URL || '',
  instanceName: process.env.EVOLUTION_INSTANCE_NAME || '',
  apiKey: process.env.EVOLUTION_API_KEY || '',
  enabled: !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_INSTANCE_NAME && process.env.EVOLUTION_API_KEY)
}

// Números de telefone das equipes
const TEAM_PHONES = {
  infra: process.env.INFRA_TEAM_PHONE || '',
  sistemas: process.env.SISTEMAS_TEAM_PHONE || ''
}

// Emojis para urgência
const URGENCY_EMOJIS = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴'
}

const URGENCY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
}

// Formatar número de telefone para WhatsApp (formato: 5511999999999)
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Se já tem código do país, retorna
  if (cleaned.startsWith('55')) {
    return cleaned
  }
  
  // Se tem 11 dígitos (DDD + número), adiciona código do país
  if (cleaned.length === 11) {
    return `55${cleaned}`
  }
  
  // Se tem 10 dígitos (DDD + número sem 9), adiciona código do país e o 9
  if (cleaned.length === 10) {
    return `55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`
  }
  
  return cleaned
}

// Formatar mensagem para o solicitante
function formatRequesterMessage(ticket: TicketData): string {
  const urgencyEmoji = URGENCY_EMOJIS[ticket.urgency as keyof typeof URGENCY_EMOJIS] || '⚪'
  const urgencyLabel = URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency
  
  return `🎫 *Chamado Criado com Sucesso!*

📋 *Número:* #${ticket.number}
📝 *Assunto:* ${ticket.subject}
${urgencyEmoji} *Urgência:* ${urgencyLabel}
📁 *Categoria:* ${ticket.category}

${ticket.assignedTo ? `👨‍💼 *Atribuído para:* ${ticket.assignedTo.name}` : '⏳ *Status:* Aguardando atribuição'}

📱 Você pode acompanhar o andamento do seu chamado pelo sistema.

_Obrigado por utilizar nosso sistema de chamados!_`
}

// Formatar mensagem para o técnico responsável
function formatAssigneeMessage(ticket: TicketData): string {
  const urgencyEmoji = URGENCY_EMOJIS[ticket.urgency as keyof typeof URGENCY_EMOJIS] || '⚪'
  const urgencyLabel = URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency
  
  return `🔔 *Novo Chamado Atribuído!*

📋 *Número:* #${ticket.number}
📝 *Assunto:* ${ticket.subject}
${urgencyEmoji} *Urgência:* ${urgencyLabel}
📁 *Categoria:* ${ticket.category}

👤 *Solicitante:* ${ticket.requester.name}
📧 *Email:* ${ticket.requester.email}

${ticket.description ? `📄 *Descrição:*\n${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}` : ''}

🏷️ *Equipe:* ${ticket.team === 'infra' ? 'Infraestrutura' : ticket.team === 'sistemas' ? 'Sistemas' : 'Não definido'}
${ticket.service ? `🖥️ *Sistema:* ${ticket.service}` : ''}

_Acesse o sistema para mais detalhes e começar o atendimento._`
}

// Enviar mensagem via Evolution API
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!EVOLUTION_CONFIG.enabled) {
    console.log('⚠️  Evolution API não configurada')
    return false
  }

  try {
    const formattedPhone = formatPhoneNumber(phone)
    console.log(`📱 Enviando WhatsApp para: ${formattedPhone}`)

    const url = `${EVOLUTION_CONFIG.apiUrl}/message/sendText/${EVOLUTION_CONFIG.instanceName}`
    
    const payload = {
      number: formattedPhone,
      text: message
    }

    // Criar AbortController para timeout de 10 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_CONFIG.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        await response.json() // Consumir resposta
        console.log(`✅ WhatsApp enviado com sucesso para: ${formattedPhone}`)
        return true
      } else {
        const errorText = await response.text()
        console.error(`❌ Erro ao enviar WhatsApp:`, response.status, response.statusText, errorText)
        return false
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error(`⏱️  Timeout ao enviar WhatsApp para: ${formattedPhone}`)
      } else {
        throw fetchError
      }
      return false
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar WhatsApp:`, error)
    return false
  }
}

// Formatar mensagem para a equipe (grupo)
function formatTeamMessage(ticket: TicketData): string {
  const urgencyEmoji = URGENCY_EMOJIS[ticket.urgency as keyof typeof URGENCY_EMOJIS] || '⚪'
  const urgencyLabel = URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency
  
  return `🔔 *Novo Chamado - ${ticket.team === 'infra' ? 'Infraestrutura' : 'Sistemas'}*

📋 *Número:* #${ticket.number}
📝 *Assunto:* ${ticket.subject}
${urgencyEmoji} *Urgência:* ${urgencyLabel}
📁 *Categoria:* ${ticket.category}

👤 *Solicitante:* ${ticket.requester.name}
📧 *Email:* ${ticket.requester.email}

${ticket.description ? `📄 *Descrição:*\n${ticket.description.substring(0, 200)}${ticket.description.length > 200 ? '...' : ''}` : ''}

${ticket.assignedTo ? `👨‍💼 *Atribuído para:* ${ticket.assignedTo.name}` : '⏳ *Status:* Aguardando atribuição'}
${ticket.service ? `🖥️ *Sistema:* ${ticket.service}` : ''}

_Acesse o sistema para mais detalhes._`
}

// Notificar criação de chamado via WhatsApp
export async function notifyTicketCreatedWhatsApp(ticket: TicketData): Promise<void> {
  console.log('🔍 [WhatsApp] Função notifyTicketCreatedWhatsApp chamada')
  console.log('🔍 [WhatsApp] Ticket:', { id: ticket.id, number: ticket.number, team: ticket.team })
  console.log('🔍 [WhatsApp] Config enabled:', EVOLUTION_CONFIG.enabled)
  console.log('🔍 [WhatsApp] Config:', {
    apiUrl: EVOLUTION_CONFIG.apiUrl ? '✅' : '❌',
    instanceName: EVOLUTION_CONFIG.instanceName ? '✅' : '❌',
    apiKey: EVOLUTION_CONFIG.apiKey ? '✅' : '❌',
  })
  
  if (!EVOLUTION_CONFIG.enabled) {
    console.log('⚠️  Notificações WhatsApp desabilitadas. Configure as variáveis de ambiente:')
    console.log('   EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL || 'NÃO CONFIGURADA')
    console.log('   EVOLUTION_INSTANCE_NAME:', process.env.EVOLUTION_INSTANCE_NAME || 'NÃO CONFIGURADA')
    console.log('   EVOLUTION_API_KEY:', process.env.EVOLUTION_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA')
    return
  }

  console.log('📢 Iniciando envio de notificações WhatsApp...')

  const notifications: Promise<boolean>[] = []

  // 1. Notificar a equipe (número do grupo/líder da equipe)
  const teamPhone = ticket.team === 'infra' ? TEAM_PHONES.infra : 
                    ticket.team === 'sistemas' ? TEAM_PHONES.sistemas : ''
  
  if (teamPhone) {
    console.log(`📱 Enviando notificação para equipe ${ticket.team}`)
    const teamMessage = formatTeamMessage(ticket)
    notifications.push(sendWhatsAppMessage(teamPhone, teamMessage))
  } else {
    console.log(`⚠️  Número da equipe ${ticket.team} não configurado`)
  }

  // 2. Notificar o solicitante (se tiver telefone)
  if (ticket.requester.phone) {
    const requesterMessage = formatRequesterMessage(ticket)
    notifications.push(sendWhatsAppMessage(ticket.requester.phone, requesterMessage))
  } else {
    console.log('⚠️  Solicitante sem telefone cadastrado')
  }

  // 3. Notificar o técnico responsável (se atribuído e tiver telefone)
  if (ticket.assignedTo?.phone) {
    const assigneeMessage = formatAssigneeMessage(ticket)
    notifications.push(sendWhatsAppMessage(ticket.assignedTo.phone, assigneeMessage))
  } else if (ticket.assignedTo) {
    console.log('⚠️  Técnico responsável sem telefone cadastrado')
  }

  // Enviar todas as notificações em paralelo
  if (notifications.length > 0) {
    const results = await Promise.allSettled(notifications)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
    console.log(`📊 WhatsApp enviados: ${successful}/${notifications.length}`)
  } else {
    console.log('⚠️  Nenhuma notificação WhatsApp para enviar (sem telefones cadastrados)')
  }
}

// Notificar atualização de status do chamado
export async function notifyTicketStatusUpdate(
  ticket: TicketData,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  if (!EVOLUTION_CONFIG.enabled || !ticket.requester.phone) {
    return
  }

  const message = `🔄 *Atualização do Chamado #${ticket.number}*

📝 *Assunto:* ${ticket.subject}

📊 *Status alterado:*
De: ${oldStatus}
Para: ${newStatus}

_Acesse o sistema para mais detalhes._`

  await sendWhatsAppMessage(ticket.requester.phone, message)
}

// Notificar conclusão do chamado
export async function notifyTicketClosed(ticket: TicketData): Promise<void> {
  if (!EVOLUTION_CONFIG.enabled || !ticket.requester.phone) {
    return
  }

  const message = `✅ *Chamado Concluído!*

📋 *Número:* #${ticket.number}
📝 *Assunto:* ${ticket.subject}

🎉 Seu chamado foi concluído com sucesso!

⭐ *Avalie nosso atendimento:*
Acesse o sistema para avaliar o atendimento e deixar seu feedback.

_Obrigado por utilizar nosso sistema de chamados!_`

  await sendWhatsAppMessage(ticket.requester.phone, message)
}

// Função para testar envio de WhatsApp
export async function testWhatsApp(phone: string): Promise<boolean> {
  const testMessage = `🧪 *Teste de Notificação WhatsApp*

Este é um teste do sistema de notificações via WhatsApp.

✅ Se você recebeu esta mensagem, o sistema está funcionando corretamente!

_Sistema de Chamados - Profood_`

  return sendWhatsAppMessage(phone, testMessage)
}
