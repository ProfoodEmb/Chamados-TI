"use client"

import { useEffect, useState } from "react"
import { X, Megaphone, Info, AlertTriangle, Wrench, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NoticeToastProps {
  notice: {
    id: string
    title: string
    type: "info" | "warning" | "maintenance" | "update"
    priority: "low" | "medium" | "high" | "critical"
  }
  onClose: () => void
  duration?: number
}

export function NoticeToast({ notice, onClose, duration = 8000 }: NoticeToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animar entrada
    setTimeout(() => setIsVisible(true), 100)

    // Auto-close
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Aguardar animação de saída
  }

  const getIcon = () => {
    switch (notice.type) {
      case "info":
        return Info
      case "warning":
        return AlertTriangle
      case "maintenance":
        return Wrench
      case "update":
        return Sparkles
      default:
        return Megaphone
    }
  }

  const getColors = () => {
    switch (notice.type) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "maintenance":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "update":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getPriorityIndicator = () => {
    switch (notice.priority) {
      case "high":
        return "🔴"
      case "medium":
        return "�"
      case "low":
        return "�"
      default:
        return ""
    }
  }

  const Icon = getIcon()

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`rounded-lg border-2 p-4 shadow-lg ${getColors()}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">NOVO AVISO</span>
              <span className="text-xs">{getPriorityIndicator()}</span>
            </div>
            <p className="text-sm font-semibold leading-tight">
              {notice.title}
            </p>
            <p className="text-xs mt-1 opacity-75">
              Clique para ver todos os avisos
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}