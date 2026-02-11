"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'info'
}

export function SimpleToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    
    // Remover após 3 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // Expor função globalmente
  useEffect(() => {
    (window as any).showSimpleToast = addToast
    return () => {
      delete (window as any).showSimpleToast
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white
            transform transition-all duration-300 animate-in slide-in-from-right-2
            ${toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}
          `}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}