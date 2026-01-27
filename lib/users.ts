export interface User {
  id: string
  username: string
  name: string
  role: "admin" | "lider_infra" | "func_infra" | "lider_sistemas" | "func_sistemas"
  team: "infra" | "sistemas" | "admin"
  email: string
}

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    name: "Administrador Geral",
    role: "admin",
    team: "admin",
    email: "admin@empresa.com"
  },
  {
    id: "2",
    username: "lider_infra",
    name: "João Silva",
    role: "lider_infra",
    team: "infra",
    email: "joao.silva@empresa.com"
  },
  {
    id: "3",
    username: "func_infra",
    name: "Maria Santos",
    role: "func_infra",
    team: "infra",
    email: "maria.santos@empresa.com"
  },
  {
    id: "4",
    username: "lider_sistemas",
    name: "Pedro Costa",
    role: "lider_sistemas",
    team: "sistemas",
    email: "pedro.costa@empresa.com"
  },
  {
    id: "5",
    username: "func_sistemas",
    name: "Ana Oliveira",
    role: "func_sistemas",
    team: "sistemas",
    email: "ana.oliveira@empresa.com"
  }
]

// Credenciais de login
export const credentials = {
  admin: { password: "admin123", userId: "1" },
  lider_infra: { password: "lider123", userId: "2" },
  func_infra: { password: "func123", userId: "3" },
  lider_sistemas: { password: "lider123", userId: "4" },
  func_sistemas: { password: "func123", userId: "5" },
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id)
}

export function canAssignTickets(role: string): boolean {
  return role === "admin" || role === "lider_infra" || role === "lider_sistemas"
}

export function canViewAllTickets(role: string): boolean {
  return role === "admin"
}

export function canViewTeamTickets(role: string, team: string): boolean {
  if (role === "admin") return true
  if (role === "lider_infra" && team === "infra") return true
  if (role === "lider_sistemas" && team === "sistemas") return true
  return false
}
