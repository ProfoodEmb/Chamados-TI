"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Megaphone, Info, AlertTriangle, Wrench, Sparkles, Trash2, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/dialogs/confirm-dialog"
import { useNoticesPolling } from "@/lib/use-notices-polling"
import { NoticeToast } from "@/components/shared/toasts/notice-toast"

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
  author: {
    id: string
    name: string
    role: string
  }
}

interface User {
  id: string
  name: string
  role: string
  setor?: string
}

export function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastNotice, setToastNotice] = useState<any>(null)

  // Sistema de tempo real para avisos
  const { isActive: isPollingActive } = useNoticesPolling({
    enabled: !isLoading,
    onUpdate: (data) => {
      console.log('🔄 NoticeBoard recebeu onUpdate:', data.noticeCount, 'avisos')
      if (data.hasChanges && data.notices) {
        console.log('📢 Atualizando mural de avisos em tempo real')
        console.log('📋 Novos avisos:', data.notices.map((n: any) => n.title))
        setNotices(data.notices)
      }
    },
    onNewNotice: (notice) => {
      console.log('🆕 Novo aviso no mural:', notice.title)
      setToastNotice(notice)
      setShowToast(true)
      // Forçar atualização da lista também
      fetchNotices()
    },
    interval: 3000 // 3 segundos para teste mais rápido
  })

  useEffect(() => {
    fetchUser()
    fetchNotices()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/get-session")
      const session = await response.json()
      if (session?.user) {
        setUser(session.user)
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    }
  }

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices')
      if (response.ok) {
        const data = await response.json()
        setNotices(data)
      }
    } catch (error) {
      console.error('Erro ao buscar avisos:', error)
    } finally {
      setIsLoading(false)
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

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case "info":
        return Info
      case "warning":
        return AlertTriangle
      case "maintenance":
        return Wrench
      case "update":
        return Sparkles
      default:
        return Info
    }
  }

  const getNoticeColor = (type: string) => {
    // Cores baseadas no tipo
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100"
      case "warning":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
      case "maintenance":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100"
      case "update":
        return "bg-green-50 border-green-200 hover:bg-green-100"
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴 "
      case "medium":
        return "🟡 "
      case "low":
        return "🟢 "
      default:
        return ""
    }
  }

  const getLevelLabel = (level: string) => {
    // Removido - não usar mais níveis
    return ""
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "Agora"
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`
    } else if (diffInHours < 48) {
      return "Ontem"
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days} dias atrás`
    }
  }

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Filtrar avisos por setor se aplicável
  const filteredNotices = notices.filter(notice => {
    if (!notice.targetSectors) return true // Aviso para todos
    
    try {
      const targetSectors = JSON.parse(notice.targetSectors)
      if (!user?.setor) return true // Se usuário não tem setor, mostra todos
      
      return targetSectors.includes(user.setor) || targetSectors.includes("T.I.")
    } catch {
      return true // Em caso de erro no JSON, mostra o aviso
    }
  })

  // Verificar se usuário pode excluir aviso
  const canDeleteNotice = (notice: Notice) => {
    if (!user) return false
    return user.role === "admin" || user.id === notice.author.id
  }

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Megaphone className="w-3.5 h-3.5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-foreground">Mural de avisos</h2>
          <p className="text-[10px] text-muted-foreground">Fique por dentro das novidades</p>
        </div>
      </div>

      <div className="space-y-2 mb-2 max-h-[300px] overflow-y-auto scrollbar-visible">
        {isLoading ? (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="animate-pulse">
              <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.slice(0, 3).map((notice) => {
            const Icon = getNoticeIcon(notice.type)
            const isScheduled = notice.scheduledFor && new Date(notice.scheduledFor) > new Date()
            
            return (
              <div key={notice.id} className="relative">
                <Link href="/avisos">
                  <div className={`p-2 border rounded-lg transition-colors cursor-pointer ${getNoticeColor(notice.type)}`}>
                    {/* Conteúdo do aviso */}
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        <h3 className="text-[11px] font-semibold text-foreground line-clamp-1">
                          {getPriorityLabel(notice.priority)}{notice.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isScheduled && (
                          <div className="flex items-center gap-0.5 text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">
                            <Calendar className="w-2 h-2" />
                          </div>
                        )}
                        {notice.expiresAt && (
                          <div className="flex items-center gap-0.5 text-xs text-orange-600 bg-orange-100 px-1 py-0.5 rounded">
                            <Clock className="w-2 h-2" />
                          </div>
                        )}
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                          {formatDate(notice.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                    
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground">
                        Por: {notice.author.name}
                      </span>
                      
                      {/* Informações de programação */}
                      {(isScheduled || notice.expiresAt) && (
                        <div className="text-[9px] text-muted-foreground">
                          {isScheduled && (
                            <div>📅 {formatScheduledDate(notice.scheduledFor!)}</div>
                          )}
                          {notice.expiresAt && (
                            <div>⏰ Expira: {formatScheduledDate(notice.expiresAt)}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                
                {/* Botão de exclusão */}
                {canDeleteNotice(notice) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      deleteNotice(notice.id)
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir aviso"
                  >
                    <Trash2 className="w-2 h-2" />
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-[10px] text-muted-foreground">Nenhum aviso disponível</p>
          </div>
        )}
      </div>

      <Link href="/avisos">
        <Button
          variant="outline"
          className="w-full text-[10px] hover:bg-accent h-7"
        >
          Ver todos os avisos
        </Button>
      </Link>

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

      {/* Toast de novo aviso */}
      {showToast && toastNotice && (
        <NoticeToast
          notice={toastNotice}
          onClose={() => {
            setShowToast(false)
            setToastNotice(null)
          }}
        />
      )}
    </div>
  )
}
