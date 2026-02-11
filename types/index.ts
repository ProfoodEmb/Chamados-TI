// Global TypeScript types for the application

export type UserRole = 'admin' | 'lider_infra' | 'lider_sistemas' | 'tecnico_infra' | 'tecnico_sistemas' | 'user'

export type Team = 'infra' | 'sistemas'

export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Aguardando' | 'Concluído' | 'Cancelado'

export type KanbanStatus = 'backlog' | 'todo' | 'in-progress' | 'done'

export type TicketUrgency = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  team?: Team
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  ticketNumber: number
  subject: string
  description: string
  status: TicketStatus
  kanbanStatus: KanbanStatus
  urgency: TicketUrgency
  tipo: string
  categoria?: string
  sistema?: string
  anydesk?: string
  requesterId: string
  assignedToId?: string | null
  createdAt: Date
  updatedAt: Date
  closedAt?: Date | null
  rating?: number | null
  ratingComment?: string | null
  requester?: User
  assignedTo?: User | null
}

export interface Notice {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  expiresAt?: Date | null
  createdById: string
  createdAt: Date
  updatedAt: Date
  createdBy?: User
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  createdAt: Date
  user?: User
}

export interface TicketAttachment {
  id: string
  ticketId: string
  filename: string
  filepath: string
  mimetype: string
  size: number
  uploadedById: string
  createdAt: Date
  uploadedBy?: User
}
