"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface CloseConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketNumber: string
  onConfirm: (accept: boolean) => Promise<void>
}

export function CloseConfirmationDialog({
  open,
  onOpenChange,
  ticketNumber,
  onConfirm,
}: CloseConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleResponse = async (accept: boolean) => {
    setIsLoading(true)
    try {
      await onConfirm(accept)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao responder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Chamado {ticketNumber}?</DialogTitle>
          <DialogDescription>
            O suporte técnico solicitou a finalização deste chamado. 
            O problema foi resolvido?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => handleResponse(true)}
            disabled={isLoading}
            className="w-full h-auto py-4 flex items-center justify-center gap-3"
            variant="default"
          >
            <CheckCircle className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Sim, problema resolvido</div>
              <div className="text-xs opacity-90">Você poderá avaliar o atendimento</div>
            </div>
          </Button>

          <Button
            onClick={() => handleResponse(false)}
            disabled={isLoading}
            className="w-full h-auto py-4 flex items-center justify-center gap-3"
            variant="outline"
          >
            <XCircle className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Não, continuar chamado</div>
              <div className="text-xs opacity-70">O chamado permanecerá aberto</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
