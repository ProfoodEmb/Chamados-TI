// Sistema de notificações via webhook
// Envia dados de tickets para webhooks externos (Discord, Slack, etc)

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
    setor?: string | null
    empresa?: string | null
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
}

interface WebhookConfig {
  url: string
  enabled: boolean
  name: string
}

// Configuração dos webhooks
// Adicione suas URLs de webhook aqui
const WEBHOOKS: WebhookConfig[] = [
  {
    name: 'Discord - Equipe TI',
    url: process.env.DISCORD_WEBHOOK_URL || '',
    enabled: !!process.env.DISCORD_WEBHOOK_URL
  },
  {
    name: 'Slack - Equipe TI',
    url: process.env.SLACK_WEBHOOK_URL || '',
    enabled: !!process.env.SLACK_WEBHOOK_URL
  },
  // Adicione mais webhooks conforme necessário
]

// Cores para urgência
const URGENCY_COLORS = {
  low: 0x22c55e,      // Verde
  medium: 0xeab308,   // Amarelo
  high: 0xf97316,     // Laranja
  critical: 0xef4444  // Vermelho
}

const URGENCY_LABELS = {
  low: '🟢 Baixa',
  medium: '🟡 Média',
  high: '🟠 Alta',
  critical: '🔴 Crítica'
}

// Formatar mensagem para Discord
function formatDiscordMessage(ticket: TicketData) {
  const urgencyColor = URGENCY_COLORS[ticket.urgency as keyof typeof URGENCY_COLORS] || 0x6b7280
  const urgencyLabel = URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency

  return {
    embeds: [{
      title: '🎫 Novo Chamado Criado',
      description: `**${ticket.subject}**`,
      color: urgencyColor,
      fields: [
        {
          name: '📋 Número',
          value: `#${ticket.number}`,
          inline: true
        },
        {
          name: '⚡ Urgência',
          value: urgencyLabel,
          inline: true
        },
        {
          name: '📁 Categoria',
          value: ticket.category,
          inline: true
        },
        {
          name: '👤 Solicitante',
          value: `${ticket.requester.name}\n${ticket.requester.email}`,
          inline: true
        },
        {
          name: '🏢 Setor/Empresa',
          value: `${ticket.requester.setor || 'N/A'} - ${ticket.requester.empresa || 'N/A'}`,
          inline: true
        },
        {
          name: '👨‍💼 Atribuído para',
          value: ticket.assignedTo?.name || '⏳ Não atribuído',
          inline: true
        },
        {
          name: '🏷️ Equipe',
          value: ticket.team === 'infra' ? '🔧 Infraestrutura' : 
                 ticket.team === 'sistemas' ? '💻 Sistemas' : 
                 '❓ Não definido',
          inline: true
        },
        {
          name: '🖥️ Sistema',
          value: ticket.service || 'N/A',
          inline: true
        },
        {
          name: '📝 Descrição',
          value: ticket.description ? 
            (ticket.description.length > 200 ? 
              ticket.description.substring(0, 200) + '...' : 
              ticket.description) : 
            'Sem descrição',
          inline: false
        }
      ],
      timestamp: new Date(ticket.createdAt).toISOString(),
      footer: {
        text: 'Sistema de Chamados'
      }
    }]
  }
}

// Formatar mensagem para Slack
function formatSlackMessage(ticket: TicketData) {
  const urgencyLabel = URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency
  
  return {
    text: `🎫 Novo Chamado: #${ticket.number}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎫 Novo Chamado Criado',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Número:*\n#${ticket.number}`
          },
          {
            type: 'mrkdwn',
            text: `*Urgência:*\n${urgencyLabel}`
          },
          {
            type: 'mrkdwn',
            text: `*Categoria:*\n${ticket.category}`
          },
          {
            type: 'mrkdwn',
            text: `*Solicitante:*\n${ticket.requester.name}`
          },
          {
            type: 'mrkdwn',
            text: `*Atribuído:*\n${ticket.assignedTo?.name || 'Não atribuído'}`
          },
          {
            type: 'mrkdwn',
            text: `*Equipe:*\n${ticket.team === 'infra' ? '🔧 Infraestrutura' : ticket.team === 'sistemas' ? '💻 Sistemas' : 'Não definido'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Assunto:*\n${ticket.subject}`
        }
      },
      {
        type: 'divider'
      }
    ]
  }
}

// Enviar notificação para um webhook
async function sendToWebhook(webhook: WebhookConfig, ticket: TicketData): Promise<boolean> {
  if (!webhook.enabled || !webhook.url) {
    console.log(`⏭️  Webhook "${webhook.name}" desabilitado ou sem URL`)
    return false
  }

  try {
    console.log(`📤 Enviando notificação para: ${webhook.name}`)

    // Determinar formato baseado no tipo de webhook
    let payload
    if (webhook.url.includes('discord.com')) {
      payload = formatDiscordMessage(ticket)
    } else if (webhook.url.includes('slack.com')) {
      payload = formatSlackMessage(ticket)
    } else {
      // Formato genérico JSON (webhooks customizados, etc)
      payload = {
        event: 'ticket_created',
        timestamp: new Date().toISOString(),
        ticket: {
          id: ticket.id,
          number: ticket.number,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          urgency: ticket.urgency,
          urgencyLabel: URGENCY_LABELS[ticket.urgency as keyof typeof URGENCY_LABELS] || ticket.urgency,
          status: ticket.status,
          team: ticket.team,
          teamLabel: ticket.team === 'infra' ? 'Infraestrutura' : 
                     ticket.team === 'sistemas' ? 'Sistemas' : 
                     'Não definido',
          service: ticket.service,
          createdAt: ticket.createdAt,
          requester: {
            id: ticket.requester.id,
            name: ticket.requester.name,
            email: ticket.requester.email,
            setor: ticket.requester.setor,
            empresa: ticket.requester.empresa
          },
          assignedTo: ticket.assignedTo ? {
            id: ticket.assignedTo.id,
            name: ticket.assignedTo.name,
            email: ticket.assignedTo.email
          } : null
        }
      }
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      console.log(`✅ Notificação enviada com sucesso para: ${webhook.name}`)
      return true
    } else {
      const errorText = await response.text()
      console.error(`❌ Erro ao enviar para ${webhook.name}:`, response.status, response.statusText, errorText)
      return false
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar webhook para ${webhook.name}:`, error)
    return false
  }
}

// Enviar notificações para todos os webhooks configurados
export async function notifyTicketCreated(ticket: TicketData): Promise<void> {
  console.log('📢 Iniciando envio de notificações via webhook...')
  
  const enabledWebhooks = WEBHOOKS.filter(w => w.enabled)
  
  if (enabledWebhooks.length === 0) {
    console.log('⚠️  Nenhum webhook configurado. Configure as variáveis de ambiente:')
    console.log('   - DISCORD_WEBHOOK_URL')
    console.log('   - SLACK_WEBHOOK_URL')
    return
  }

  console.log(`📋 Webhooks ativos: ${enabledWebhooks.length}`)

  // Enviar para todos os webhooks em paralelo
  const promises = enabledWebhooks.map(webhook => sendToWebhook(webhook, ticket))
  const results = await Promise.allSettled(promises)

  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
  console.log(`📊 Notificações enviadas: ${successful}/${enabledWebhooks.length}`)
}

// Função para testar webhook manualmente
export async function testWebhook(webhookUrl: string): Promise<boolean> {
  const testTicket: TicketData = {
    id: 'test-id',
    number: '000000',
    subject: 'Teste de Webhook',
    description: 'Este é um ticket de teste para verificar se o webhook está funcionando corretamente.',
    category: 'Teste',
    urgency: 'low',
    status: 'Aberto',
    team: 'sistemas',
    service: 'Sistema de Testes',
    createdAt: new Date().toISOString(),
    requester: {
      id: 'test-user',
      name: 'Usuário de Teste',
      email: 'teste@exemplo.com',
      setor: 'TI',
      empresa: 'Teste'
    },
    assignedTo: {
      id: 'test-assigned',
      name: 'Técnico de Teste',
      email: 'tecnico@exemplo.com'
    }
  }

  return sendToWebhook({
    name: 'Teste Manual',
    url: webhookUrl,
    enabled: true
  }, testTicket)
}
