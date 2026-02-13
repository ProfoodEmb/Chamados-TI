"use client"

import { useState, useEffect } from "react"
import { Megaphone, Calendar, Clock, Info, AlertTriangle, Wrench, Sparkles } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "maintenance" | "update"
  priority: "low" | "medium" | "high"
  active: boolean
  createdAt: string
  author: {
    id: string
    name: string
    role: string
  }
}

export default function AvisosPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotices()
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
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 border-red-200 text-red-700"
      case "medium":
        return "bg-yellow-100 border-yellow-200 text-yellow-700"
      case "low":
        return "bg-green-100 border-green-200 text-green-700"
      default:
        return "bg-gray-100 border-gray-200 text-gray-700"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "info":
        return "Informação"
      case "warning":
        return "Aviso"
      case "maintenance":
        return "Manutenção"
      case "update":
        return "Novidade"
      default:
        return "Geral"
    }
  }

  const getTypeIcon = (type: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
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

  return (
    <div className="-mt-16 pt-16 p-4 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mural de Avisos</h1>
            <p className="text-sm text-muted-foreground">
              Fique por dentro de todas as novidades e atualizações
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Avisos */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border-2 bg-gray-100 border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notices.length > 0 ? (
          notices.map((notice) => {
            const TypeIcon = getTypeIcon(notice.type)
            return (
              <div
                key={notice.id}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${getPriorityColor(notice.priority)}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className="w-4 h-4" />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/50">
                        {getTypeLabel(notice.type)}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      {notice.title}
                    </h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-current/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(notice.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeTime(notice.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Por: {notice.author.name}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-gray-200">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum aviso disponível</h3>
            <p className="text-sm text-gray-500">
              Quando houver novos avisos, eles aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
