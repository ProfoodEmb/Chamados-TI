"use client"

import { useState, useEffect } from 'react'
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react'

interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface NotificationItemProps {
  notification: Notification
  onClose: (id: string) => void
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { id, message, type } = notification

  const icons = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
  }

  const colors = {
    success: 'bg-green-500 border-green-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600',
    error: 'bg-red-500 border-red-600',
  }

  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, notification.duration || 4000)

    return () => clearTimeout(timer)
  }, [id, notification.duration, onClose])

  return (
    <div className={`
      ${colors[type]} text-white p-4 rounded-lg shadow-lg border-l-4
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right-full
      max-w-sm w-full
    `}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium leading-tight">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Expor função globalmente para uso em outros componentes
  useEffect(() => {
    (window as any).showRealtimeNotification = addNotification
    return () => {
      delete (window as any).showRealtimeNotification
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}