export interface Message {
  id: string
  author: string
  role: "user" | "support"
  content: string
  timestamp: string
  avatar?: string
}

export interface Ticket {
  id: string
  number: string
  subject: string
  responsible: string
  requester: string
  category: string
  urgency: "high" | "medium" | "low" | "critical"
  lastAction: string
  status: "Aberto" | "Pendente" | "Fechado" | "Resolvido" | "Aguardando Aprovação"
  kanbanStatus: "inbox" | "in_progress" | "review" | "done"
  description: string
  createdAt: string
  service?: string
  dueDate?: string
  anydesk?: string
  messages: Message[]
  assignedTo?: string // ID do usuário atribuído
  team?: "infra" | "sistemas" | "automacao" // Equipe responsável
}

export const mockTickets: Ticket[] = []

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