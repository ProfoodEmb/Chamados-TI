"use client"

import { useState } from "react"
import { X, Star, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface TicketFeedbackDialogProps {
  ticketNumber: string
  onClose: () => void
  onSubmit: (rating: number, feedback: string) => Promise<void>
  onReopen: () => Promise<void>
  onConfirmResolved: () => Promise<void>
}

export function TicketFeedbackDialog({ ticketNumber, onClose, onSubmit, onReopen, onConfirmResolved }: TicketFeedbackDialogProps) {
  const [step, setStep] = useState<'confirm' | 'feedback' | 'success'>('confirm')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirmResolved = async () => {
    setIsSubmitting(true)
    try {
      await onConfirmResolved()
      setStep('feedback')
    } catch (error) {
      console.error('Erro ao confirmar:', error)
      alert('Erro ao confirmar resolução')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReopen = async () => {
    setIsSubmitting(true)
    try {
      await onReopen()
      setStep('success')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Erro ao reabrir:', error)
      alert('Erro ao reabrir chamado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(rating, feedback)
      setStep('success')
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Step 1: Confirmação */}
        {step === 'confirm' && (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Chamado Finalizado</h2>
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700 text-lg mb-2 font-medium">
                  Seu problema foi resolvido?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Chamado #{ticketNumber}
                </p>
                <p className="text-sm text-gray-600">
                  O atendente finalizou este chamado. Se o problema foi resolvido, avalie o atendimento. Caso contrário, você pode reabrir o chamado.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleConfirmResolved}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Sim, Problema Resolvido
                </Button>
                <Button
                  onClick={handleReopen}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  disabled={isSubmitting}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Reabrindo..." : "Não, Reabrir Chamado"}
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-gray-500"
                  disabled={isSubmitting}
                >
                  Decidir Depois
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Avaliação */}
        {step === 'feedback' && (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Avalie o Atendimento</h2>
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
                <p className="text-gray-700 mb-1">
                  Como você avalia o atendimento deste chamado?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Chamado #{ticketNumber}
                </p>
                
                {/* Estrelas */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <p className="text-sm text-gray-600 mb-4">
                    {rating === 1 && "Muito insatisfeito"}
                    {rating === 2 && "Insatisfeito"}
                    {rating === 3 && "Neutro"}
                    {rating === 4 && "Satisfeito"}
                    {rating === 5 && "Muito satisfeito"}
                  </p>
                )}
              </div>

              {/* Comentário opcional */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário (opcional)
                </label>
                <Textarea
                  placeholder="Deixe seu comentário sobre o atendimento..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('confirm')}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Sucesso */}
        {step === 'success' && (
          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Obrigado!
              </h3>
              <p className="text-gray-600">
                Sua avaliação foi registrada com sucesso
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
