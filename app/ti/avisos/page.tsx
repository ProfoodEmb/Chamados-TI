"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layouts/header"
import { Sidebar } from "@/components/layouts/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, Clock, Trash2, Edit, Eye, Filter } from "lucide-react"
import { CreateNoticeDialog } from "@/components/features/notices/create-notice-dialog"
import { ConfirmDialog } from "@/components/shared/dialogs/confirm-dialog"
import { useNoticesPolling } from "@/lib/use-notices-polling"

interface Notice {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "maintenance" | "update"
  priority: "low" | "medium" | "high" | "critical"
  level: "general" | "urgent" | "critical_system"
  targetSectors: string | null
  scheduledFor: string | null
  publishedAt: string | null
  expiresAt: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    role: string
  }
}

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
}

export default function AvisosManagementPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null)

  // Sistema de tempo real para avisos (página de gerenciamento)
  const { isActive: isPollingActive, lastUpdate, forceUpdate, interval } = useNoticesPolling({
    enabled: isAuthorized && !isLoading,
    onUpdate: (data) => {
      if (data.hasChanges) {
        console.log('📢 Atualizando gerenciamento de avisos em tempo real')
        fetchNotices()
      }
    },
    interval: 8000 // 8 segundos para gerenciamento
  })

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          const userRole = session.user.role
          const authorized = userRole === "admin" || 
                           userRole === "lider_infra" || 
                           userRole === "lider_sistemas"
          
          if (!authorized) {
            window.location.href = "/ti"
            return
          }
          
          setUser(session.user)
          setIsAuthorized(true)
          
          // Buscar avisos
          await fetchNotices()
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
        window.location.href = "/ti"
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices/all')
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
      }
    } catch (error) {
      console.error('Erro ao buscar avisos:', error)
    }
  }

  const deleteNotice = async (noticeId: string) => {
    setNoticeToDelete(noticeId)
    setShowConfirmDialog(true)
  }

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete) return

    try {
      const response = await fetch(`/api/notices/${noticeToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log('✅ Aviso excluído com sucesso')
        fetchNotices() // Recarregar lista
      } else {
        const error = await response.json()
        alert('Erro ao excluir aviso: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao excluir aviso:', error)
      alert('Erro ao excluir aviso')
    } finally {
      setNoticeToDelete(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return "ℹ️"
      case "warning":
        return "⚠️"
      case "maintenance":
        return "🔧"
      case "update":
        return "✨"
      default:
        return "📢"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "maintenance":
        return "bg-orange-100 text-orange-700 border-orange-300"
      case "update":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getStatusLabel = (notice: Notice) => {
    const now = new Date()
    
    if (!notice.active) {
      return { label: "Inativo", color: "bg-gray-100 text-gray-700" }
    }
    
    if (notice.scheduledFor && new Date(notice.scheduledFor) > now) {
      return { label: "Programado", color: "bg-blue-100 text-blue-700" }
    }
    
    if (notice.expiresAt && new Date(notice.expiresAt) <= now) {
      return { label: "Expirado", color: "bg-red-100 text-red-700" }
    }
    
    return { label: "Ativo", color: "bg-green-100 text-green-700" }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const canEditNotice = (notice: Notice) => {
    if (!user) return false
    return user.role === "admin" || user.id === notice.author.id
  }

  // Filtrar avisos
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = searchTerm === "" || 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || notice.type === typeFilter
    
    const status = getStatusLabel(notice).label.toLowerCase()
    const matchesStatus = statusFilter === "all" || status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleNoticeCreated = () => {
    fetchNotices()
    setShowCreateDialog(false)
    // Forçar atualização em tempo real
    setTimeout(() => {
      forceUpdate()
    }, 500)
  }

  // Mostrar loading enquanto verifica autorização
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autorizado, não renderiza nada (já foi redirecionado)
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="pt-2 px-6 pb-6">
            {/* Header com gradiente */}
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="relative flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <span className="text-4xl">📢</span>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white">Gerenciar Avisos</h1>
                        <p className="text-blue-100">Crie e gerencie todos os avisos do sistema</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão Criar Aviso */}
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-white text-blue-700 hover:bg-blue-50 gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    size="lg"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Aviso
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros e Ações com visual melhorado */}
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca com ícone animado */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    placeholder="Buscar avisos por título ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                  />
                </div>

                {/* Filtro de Tipo com ícone */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-56 h-12 rounded-xl border-gray-300">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <SelectValue placeholder="Tipo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="info">ℹ️ Informação</SelectItem>
                    <SelectItem value="warning">⚠️ Aviso</SelectItem>
                    <SelectItem value="maintenance">🔧 Manutenção</SelectItem>
                    <SelectItem value="update">✨ Novidade</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-56 h-12 rounded-xl border-gray-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="programado">🕐 Programado</SelectItem>
                    <SelectItem value="expirado">❌ Expirado</SelectItem>
                    <SelectItem value="inativo">⏸️ Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Avisos com animações */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Carregando avisos...</p>
                  </div>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-4xl">📢</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Nenhum aviso encontrado</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                      ? "Tente ajustar os filtros de busca para encontrar o que procura"
                      : "Comece criando seu primeiro aviso clicando no botão acima"
                    }
                  </p>
                  {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Primeiro Aviso
                    </Button>
                  )}
                </div>
              ) : (
                filteredNotices.map((notice, index) => {
                  const status = getStatusLabel(notice)
                  return (
                    <div 
                      key={notice.id} 
                      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header com ícone maior */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl group-hover:scale-110 transition-transform">
                              <span className="text-3xl">{getTypeIcon(notice.type)}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{notice.title}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={`${getTypeColor(notice.type)} border-2 font-medium`}>
                                  {notice.type === "info" && "Informação"}
                                  {notice.type === "warning" && "Aviso"}
                                  {notice.type === "maintenance" && "Manutenção"}
                                  {notice.type === "update" && "Novidade"}
                                </Badge>
                                <Badge variant="outline" className={`${getPriorityColor(notice.priority)} border-2 font-medium`}>
                                  {notice.priority === "low" && "Baixa"}
                                  {notice.priority === "medium" && "Média"}
                                  {notice.priority === "high" && "Alta"}
                                </Badge>
                                <Badge variant="outline" className={`${status.color} border-2 font-medium`}>
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Conteúdo */}
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-base">{notice.content}</p>

                          {/* Informações adicionais com ícones */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Criado:</span>
                              <span>{formatDate(notice.createdAt)}</span>
                            </div>
                            
                            {notice.scheduledFor && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Programado:</span>
                                <span>{formatDate(notice.scheduledFor)}</span>
                              </div>
                            )}
                            
                            {notice.expiresAt && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/30 rounded-lg px-3 py-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">Expira:</span>
                                <span>{formatDate(notice.expiresAt)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                              <span className="font-medium">Por:</span>
                              <span>{notice.author.name}</span>
                            </div>
                            
                            {notice.targetSectors && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 col-span-2">
                                <span className="font-medium">Setores:</span>
                                <span>{JSON.parse(notice.targetSectors).join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações com hover melhorado */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Visualizar"
                            className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {canEditNotice(notice) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Editar"
                                className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteNotice(notice.id)}
                                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog de criação de aviso */}
      <CreateNoticeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onNoticeCreated={handleNoticeCreated}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Excluir aviso"
        message="Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteNotice}
      />
    </div>
  )
}