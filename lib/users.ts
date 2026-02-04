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
    name: "Vinicius Mathues",
    role: "admin",
    team: "admin",
    email: "admin@empresa.com"
  },
  {
    id: "2",
    username: "lider_infra",
    name: "Jackson Felipe",
    role: "lider_infra",
    team: "infra",
    email: "jackson.felipe@empresa.com"
  },
  {
    id: "3",
    username: "func_infra",
    name: "Gustavo Americano",
    role: "func_infra",
    team: "infra",
    email: "gustavo.americano@empresa.com"
  },
  {
    id: "4",
    username: "lider_sistemas",
    name: "Antony Gouvea",
    role: "lider_sistemas",
    team: "sistemas",
    email: "antony.gouvea@empresa.com"
  },
  {
    id: "5",
    username: "func_sistemas",
    name: "Danilo Oliveira",
    role: "func_sistemas",
    team: "sistemas",
    email: "danilo.oliveira@empresa.com"
  }
]

// Credenciais de login
export const credentials = {
  admin: { password: "admin123", userId: "1" },
  lider_infra: { password: "lider123", userId: "2" },
  func_infra: { password: "func1234", userId: "3" },
  lider_sistemas: { password: "lider123", userId: "4" },
  func_sistemas: { password: "func1234", userId: "5" },
  usuario: { password: "usuario123", userId: "6" },
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
