"use client"

import { useEffect, useState } from "react"
import { User, Mail, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  team: string
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão:", error)
      }
    }

    if (open) {
      fetchUser()
    }
  }, [open])

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador Geral",
      lider_infra: "Líder de Infraestrutura",
      func_infra: "Funcionário de Infraestrutura",
      lider_sistemas: "Líder de Sistemas",
      func_sistemas: "Funcionário de Sistemas",
      user: "Usuário",
    }
    return roles[role] || "Usuário"
  }

  const getTeamLabel = (team: string) => {
    const teams: Record<string, string> = {
      admin: "Administração",
      infra: "Infraestrutura",
      sistemas: "Sistemas",
      user: "Geral",
    }
    return teams[team] || "Geral"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">
          Meu Perfil
        </DialogTitle>
        
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-white/20 shadow-xl">
              <AvatarImage src="/abstract-geometric-shapes.png" alt={user?.name || "Usuário"} />
              <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                {user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user?.name || "Carregando..."}</h2>
              <p className="text-white/90 text-sm">{user ? getRoleLabel(user.role) : "..."}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          
          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Informações de Contato
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email || "..."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Informações Profissionais
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Setor</p>
                  <p className="text-sm font-medium text-gray-900">{user ? getTeamLabel(user.team) : "..."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informação sobre alteração de senha */}
          <div className="pt-4 border-t">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">
                Precisa alterar sua senha?
              </p>
              <p className="text-sm text-blue-800">
                Entre em contato com o administrador do sistema ou com a equipe de T.I.
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Ativo
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
