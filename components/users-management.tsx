"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus, MoreVertical, Shield, ShieldOff, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateUserDialog } from "./create-user-dialog"
import { ConfirmDialog } from "./confirm-dialog"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
  setor: string | null
  empresa: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface UsersManagementProps {
  currentUser: any
}

export function UsersManagement({ currentUser }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: "",
    userName: ""
  })

  // Carregar usuários
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "todos") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/users?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setFilteredUsers(data.users || [])
      } else {
        console.error("Erro ao carregar usuários:", data.error)
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [statusFilter, searchTerm])

  // Atualizar status do usuário
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(data.message, 'success')
        }
        fetchUsers() // Recarregar lista
      } else {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`Erro: ${data.error}`, 'info')
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
        (window as any).showSimpleToast("Erro ao atualizar usuário", 'info')
      }
    }
  }

  // Deletar usuário
  const deleteUser = async (userId: string, userName: string) => {
    setDeleteDialog({ open: true, userId, userName })
  }

  const confirmDelete = async () => {
    const { userId } = deleteDialog

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`🗑️ ${data.message}`, 'success')
        }
        fetchUsers() // Recarregar lista
      } else {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`Erro: ${data.error}`, 'info')
        }
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
      if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
        (window as any).showSimpleToast("Erro ao deletar usuário", 'info')
      }
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap: { [key: string]: { label: string; color: string } } = {
      admin: { label: "Admin", color: "bg-purple-100 text-purple-800" },
      lider_infra: { label: "Líder Infra", color: "bg-blue-100 text-blue-800" },
      func_infra: { label: "Func. Infra", color: "bg-cyan-100 text-cyan-800" },
      lider_sistemas: { label: "Líder Sistemas", color: "bg-green-100 text-green-800" },
      func_sistemas: { label: "Func. Sistemas", color: "bg-lime-100 text-lime-800" },
      user: { label: "Usuário", color: "bg-gray-100 text-gray-800" },
    }

    const roleInfo = roleMap[role] || { label: role, color: "bg-gray-100 text-gray-800" }
    return <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      ativo: { label: "Ativo", color: "bg-green-100 text-green-800" },
      suspenso: { label: "Suspenso", color: "bg-yellow-100 text-yellow-800" },
      inativo: { label: "Inativo", color: "bg-red-100 text-red-800" },
    }

    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-gray-600">Visualize e gerencie todos os usuários do sistema</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, username, email ou setor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex gap-2 mb-1">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {user.setor && `${user.setor} • `}
                        {user.empresa && user.empresa.charAt(0).toUpperCase() + user.empresa.slice(1)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Criado em {formatDate(user.createdAt)}
                      </p>
                    </div>

                    {/* Menu de Ações */}
                    {user.id !== currentUser?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === "ativo" ? (
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, "suspenso")}
                              className="text-yellow-600"
                            >
                              <EyeOff className="w-4 h-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, "ativo")}
                              className="text-green-600"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          
                          {user.status !== "inativo" && (
                            <DropdownMenuItem
                              onClick={() => updateUserStatus(user.id, "inativo")}
                              className="text-gray-600"
                            >
                              <ShieldOff className="w-4 h-4 mr-2" />
                              Desativar
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => deleteUser(user.id, user.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Criar Usuário */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={fetchUsers}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Deletar Usuário"
        message={`Tem certeza que deseja deletar o usuário "${deleteDialog.userName}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}