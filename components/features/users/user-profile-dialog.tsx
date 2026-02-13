"use client"

import { useEffect, useState } from "react"
import { User, Mail, Building2, Lock, Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

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

  const handleChangePassword = async () => {
    setPasswordError("")

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos os campos são obrigatórios")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }

    try {
      setIsChangingPassword(true)
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        alert("Senha alterada com sucesso!")
        setShowChangePassword(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const error = await response.json()
        setPasswordError(error.error || "Erro ao alterar senha")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setPasswordError("Erro ao alterar senha")
    } finally {
      setIsChangingPassword(false)
    }
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
          
          {!showChangePassword ? (
            <>
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

              {/* Botão Mudar Senha */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Mudar Senha
                </Button>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Ativo
                </Badge>
              </div>
            </>
          ) : (
            <>
              {/* Formulário de Mudança de Senha */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Alterar Senha
                </h3>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Senha Atual */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha (mín. 6 caracteres)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Digite a nova senha novamente"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false)
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                      setPasswordError("")
                    }}
                    className="flex-1"
                    disabled={isChangingPassword}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
