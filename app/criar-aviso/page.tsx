"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, Clock, Trash2, Edit, Eye, Filter, Megaphone, Wifi, WifiOff } from "lucide-react"
import { CreateNoticeDialog } from "@/components/create-notice-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
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

export default function CriarAvisoPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null)

  // Sistema de tempo real para avisos
  const { isActive: isPollingActive, lastUpdate, forceUpdate, interval } = useNoticesPolling({
    enabled: !isLoading && !!user,
    onUpdate: (data) => {
      console.log('🔄 Página Avisos recebeu onUpdate:', data.noticeCount, 'avisos')
      if (data.hasChanges && data.notices) {
        console.log('📢 Atualizando lista de avisos em tempo real')
        console.log('📋 Novos avisos:', data.notices.map((n: any) => n.title))
        setNotices(data.notices)
      }
    },
    interval: 3000 // 3 segundos para teste mais rápido
  })

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("/api/auth/get-session")
        const session = await response.json()
        
        if (session?.user) {
          setUser(session.user)
          
          // Buscar avisos
          await fetchNotices()
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices')
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
        // Forçar atualização em tempo real
        setTimeout(() => {
          forceUpdate()
        }, 500)
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

  const canCreateNotice = () => {
    if (!user) return false
    return user.role === "admin" || 
           user.role === "lider_infra" || 
           user.role === "func_infra" || 
           user.role === "lider_sistemas" || 
           user.role === "func_sistemas"
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
    console.log('🆕 Aviso criado - atualizando lista')
    setShowCreateDialog(false)
    
    // Atualização imediata
    fetchNotices()
    
    // Forçar atualização do sistema de tempo real após um pequeno delay
    setTimeout(() => {
      console.log('🔄 Forçando atualização do tempo real')
      forceUpdate()
    }, 1000)
    
    // Segunda atualização para garantir
    setTimeout(() => {
      fetchNotices()
    }, 2000)
  }

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando avisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 md:pl-16">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Avisos</h1>
                    <p className="text-muted-foreground">
                      {canCreateNotice() 
                        ? "Visualize todos os avisos e crie novos" 
                        : "Visualize todos os avisos do sistema"
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Indicador de tempo real */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
                    {isPollingActive ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Tempo Real ({interval}s)
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-muted-foreground">Desconectado</span>
                      </>
                    )}
                  </div>

                  {/* Botão Atualizar */}
                  <Button 
                    variant="outline" 
                    onClick={forceUpdate}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Atualizar
                  </Button>

                  {/* Botão Criar Aviso - apenas para usuários T.I. */}
                  {canCreateNotice() && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Novo Aviso
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filtros e Ações */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar avisos por título ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro de Tipo */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="update">Novidade</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="programado">Programado</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status de atualização */}
              {isPollingActive && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Última atualização: {lastUpdate}</span>
                    <span>Próxima verificação em {interval}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Avisos */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando avisos...</p>
                  </div>
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                      ? "Nenhum aviso encontrado"
                      : "Nenhum aviso criado ainda"
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                      ? "Tente ajustar os filtros de busca"
                      : canCreateNotice() 
                        ? "Crie seu primeiro aviso clicando no botão acima"
                        : "Aguarde novos avisos da equipe T.I."
                    }
                  </p>
                  {!searchTerm && typeFilter === "all" && statusFilter === "all" && canCreateNotice() && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Aviso
                    </Button>
                  )}
                </div>
              ) : (
                filteredNotices.map((notice) => {
                  const status = getStatusLabel(notice)
                  return (
                    <div key={notice.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{getTypeIcon(notice.type)}</span>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground">{notice.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getTypeColor(notice.type)}>
                                  {notice.type === "info" && "Informação"}
                                  {notice.type === "warning" && "Aviso"}
                                  {notice.type === "maintenance" && "Manutenção"}
                                  {notice.type === "update" && "Novidade"}
                                </Badge>
                                <Badge variant="outline" className={getPriorityColor(notice.priority)}>
                                  {notice.priority === "low" && "Baixa"}
                                  {notice.priority === "medium" && "Média"}
                                  {notice.priority === "high" && "Alta"}
                                </Badge>
                                <Badge variant="outline" className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Conteúdo */}
                          <p className="text-muted-foreground mb-4 line-clamp-2">{notice.content}</p>

                          {/* Informações adicionais */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Criado: {formatDate(notice.createdAt)}</span>
                            </div>
                            
                            {notice.scheduledFor && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Programado: {formatDate(notice.scheduledFor)}</span>
                              </div>
                            )}
                            
                            {notice.expiresAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Expira: {formatDate(notice.expiresAt)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <span>Por: {notice.author.name}</span>
                            </div>
                            
                            {notice.targetSectors && (
                              <div className="flex items-center gap-2">
                                <span>Setores: {JSON.parse(notice.targetSectors).join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {canEditNotice(notice) && (
                            <>
                              <Button variant="ghost" size="sm" title="Editar">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteNotice(notice.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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