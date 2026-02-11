"use client"

import { useState } from "react"
import { X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CloseTicketDialogProps {
  ticketNumber: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function CloseTicketDialog({ ticketNumber, onClose, onConfirm }: CloseTicketDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      alert("Chamado finalizado com sucesso!")
      onClose()
    } catch (error) {
      console.error('Erro ao finalizar:', error)
      alert('Erro ao finalizar chamado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Finalizar Chamado</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 text-lg mb-2">
              Tem certeza que deseja finalizar este chamado?
            </p>
            <p className="text-sm text-gray-500">
              Chamado #{ticketNumber}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              O usuário receberá uma solicitação de avaliação.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finalizando..." : "Sim, Finalizar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
