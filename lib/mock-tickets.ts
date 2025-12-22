export interface Ticket {
  id: string
  number: string
  subject: string
  responsible: string
  category: string
  urgency: "high" | "medium" | "low" | "critical"
  lastAction: string
  status: "Aberto" | "Pendente" | "Fechado" | "Resolvido" | "Aguardando Aprovação"
  description: string
  createdAt: string
}

export const mockTickets: Ticket[] = [
  {
    id: "1",
    number: "79696",
    subject: "Estamos sem internet na gráfica",
    responsible: "Jefferson Maximino Junior",
    category: "Solicitação de serviço",
    urgency: "critical",
    lastAction: "18/12/2025 14:58",
    status: "Fechado",
    description: "Problema de conectividade na rede da gráfica",
    createdAt: "18/12/2025 10:30"
  },
  {
    id: "2",
    number: "79664",
    subject: "Problema de comunicação - SRV Portal",
    responsible: "Pedro Lucas Muxfeldt",
    category: "Problema/Incidente",
    urgency: "high",
    lastAction: "17/12/2025 17:19",
    status: "Pendente",
    description: "Servidor do portal apresentando instabilidade",
    createdAt: "17/12/2025 09:15"
  },
  {
    id: "3",
    number: "79449",
    subject: "Criação de uma VM",
    responsible: "Julia Andreolli",
    category: "Solicitação de serviço",
    urgency: "medium",
    lastAction: "11/12/2025 17:34",
    status: "Aberto",
    description: "Solicitação de nova máquina virtual para desenvolvimento",
    createdAt: "11/12/2025 08:20"
  },
  {
    id: "4",
    number: "79364",
    subject: "Criação de uma conta nova",
    responsible: "Pedro Lucas Muxfeldt",
    category: "Solicitação de serviço",
    urgency: "low",
    lastAction: "09/12/2025 19:06",
    status: "Resolvido",
    description: "Nova conta de usuário para funcionário",
    createdAt: "09/12/2025 14:45"
  },
  {
    id: "5",
    number: "79362",
    subject: "Ajuste no Dashboard do Servidores",
    responsible: "Service Desk",
    category: "Solicitação de serviço",
    urgency: "low",
    lastAction: "15/12/2025 09:04",
    status: "Fechado",
    description: "Melhorias na interface do dashboard",
    createdAt: "15/12/2025 07:30"
  },
  {
    id: "6",
    number: "79800",
    subject: "Sistema de backup não está funcionando",
    responsible: "Carlos Silva",
    category: "Problema/Incidente",
    urgency: "critical",
    lastAction: "20/12/2025 08:30",
    status: "Aberto",
    description: "Falha crítica no sistema de backup automático",
    createdAt: "20/12/2025 07:00"
  },
  {
    id: "7",
    number: "79801",
    subject: "Instalação de software no laboratório",
    responsible: "Ana Costa",
    category: "Solicitação de serviço",
    urgency: "medium",
    lastAction: "19/12/2025 16:45",
    status: "Pendente",
    description: "Instalação de softwares específicos para o laboratório",
    createdAt: "19/12/2025 10:20"
  },
  {
    id: "8",
    number: "79802",
    subject: "Problema de impressão na recepção",
    responsible: "Maria Santos",
    category: "Problema/Incidente",
    urgency: "low",
    lastAction: "18/12/2025 11:20",
    status: "Aguardando Aprovação",
    description: "Impressora da recepção não está funcionando",
    createdAt: "18/12/2025 09:15"
  },
  {
    id: "9",
    number: "79803",
    subject: "Configuração de email corporativo",
    responsible: "João Oliveira",
    category: "Solicitação de serviço",
    urgency: "medium",
    lastAction: "17/12/2025 14:30",
    status: "Resolvido",
    description: "Configuração de email para novo funcionário",
    createdAt: "17/12/2025 08:45"
  },
  {
    id: "10",
    number: "79804",
    subject: "Atualização do sistema operacional",
    responsible: "Tech Support",
    category: "Solicitação de serviço",
    urgency: "high",
    lastAction: "21/12/2025 10:15",
    status: "Aberto",
    description: "Atualização de segurança do sistema operacional",
    createdAt: "21/12/2025 08:00"
  },
  {
    id: "11",
    number: "79805",
    subject: "Problema de acesso ao sistema financeiro",
    responsible: "Roberto Lima",
    category: "Problema/Incidente",
    urgency: "high",
    lastAction: "20/12/2025 15:20",
    status: "Pendente",
    description: "Usuários não conseguem acessar o sistema financeiro",
    createdAt: "20/12/2025 13:30"
  },
  {
    id: "12",
    number: "79806",
    subject: "Manutenção preventiva dos servidores",
    responsible: "Service Desk",
    category: "Solicitação de serviço",
    urgency: "medium",
    lastAction: "16/12/2025 18:00",
    status: "Fechado",
    description: "Manutenção preventiva mensal dos servidores",
    createdAt: "16/12/2025 06:00"
  }
]

export type FilterType = "all" | "pending" | "closed" | "resolved" | "awaiting-approval"

export const filterTickets = (tickets: Ticket[], filter: FilterType, searchTerm: string = ""): Ticket[] => {
  let filtered = tickets

  // Aplicar filtro por status
  switch (filter) {
    case "pending":
      filtered = tickets.filter(ticket => ticket.status === "Pendente" || ticket.status === "Aberto")
      break
    case "closed":
      filtered = tickets.filter(ticket => ticket.status === "Fechado")
      break
    case "resolved":
      filtered = tickets.filter(ticket => ticket.status === "Resolvido")
      break
    case "awaiting-approval":
      filtered = tickets.filter(ticket => ticket.status === "Aguardando Aprovação")
      break
    case "all":
    default:
      filtered = tickets
      break
  }

  // Aplicar busca por texto
  if (searchTerm && searchTerm.length >= 3) {
    const search = searchTerm.toLowerCase()
    filtered = filtered.filter(ticket =>
      ticket.number.toLowerCase().includes(search) ||
      ticket.subject.toLowerCase().includes(search) ||
      ticket.responsible.toLowerCase().includes(search) ||
      ticket.category.toLowerCase().includes(search) ||
      ticket.status.toLowerCase().includes(search)
    )
  }

  return filtered
}