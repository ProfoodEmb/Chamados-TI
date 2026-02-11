"use client"

import { useState } from "react"
import { X, Info, AlertTriangle, Wrench, Sparkles, Calendar, Clock, Target, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateNoticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNoticeCreated?: () => void
}

export function CreateNoticeDialog({ 
  open, 
  onOpenChange,
  onNoticeCreated
}: CreateNoticeDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "",
    priority: "",
    level: "general",
    targetSectors: [] as string[],
    customSector: "",
    scheduledFor: "",
    expiresAt: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const noticeTypes = [
    {
      value: "info",
      label: "Informação",
      icon: Info,
      color: "bg-blue-500",
      description: "Informações gerais"
    },
    {
      value: "warning",
      label: "Aviso",
      icon: AlertTriangle,
      color: "bg-yellow-500",
      description: "Avisos importantes"
    },
    {
      value: "maintenance",
      label: "Manutenção",
      icon: Wrench,
      color: "bg-orange-500",
      description: "Manutenção programada"
    },
    {
      value: "update",
      label: "Novidade",
      icon: Sparkles,
      color: "bg-green-500",
      description: "Atualizações e novidades"
    }
  ]

  const priorities = [
    {
      value: "low",
      label: "Baixa",
      color: "border-green-300 bg-green-50 text-green-700"
    },
    {
      value: "medium",
      label: "Média",
      color: "border-yellow-300 bg-yellow-50 text-yellow-700"
    },
    {
      value: "high",
      label: "Alta",
      color: "border-red-300 bg-red-50 text-red-700"
    }
  ]

  const sectors = [
    "Todos os setores", "Financeiro", "RH", "Vendas", "Marketing", "Compras", "Jurídico", 
    "Controladoria", "Comercial", "Operações", "DPI", "P&D", "Segurança do Trabalho", 
    "PCP", "CTP", "Almoxarifado", "Faturamento", "Logística", "T.I."
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSectorToggle = (sector: string) => {
    if (sector === "Todos os setores") {
      setFormData(prev => ({ 
        ...prev, 
        targetSectors: prev.targetSectors.includes("Todos os setores") ? [] : ["Todos os setores"]
      }))
    } else {
      setFormData(prev => {
        const newSectors = prev.targetSectors.includes(sector)
          ? prev.targetSectors.filter(s => s !== sector && s !== "Todos os setores")
          : [...prev.targetSectors.filter(s => s !== "Todos os setores"), sector]
        return { ...prev, targetSectors: newSectors }
      })
    }
  }

  const addCustomSector = () => {
    if (formData.customSector.trim() && !formData.targetSectors.includes(formData.customSector.trim())) {
      setFormData(prev => ({
        ...prev,
        targetSectors: [...prev.targetSectors.filter(s => s !== "Todos os setores"), prev.customSector.trim()],
        customSector: ""
      }))
    }
  }

  const removeSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      targetSectors: prev.targetSectors.filter(s => s !== sector)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.type || !formData.priority) {
      return
    }

    setIsLoading(true)
    try {
      const submitData = {
        ...formData,
        targetSectors: formData.targetSectors.length === 0 || formData.targetSectors.includes("Todos os setores") 
          ? null 
          : JSON.stringify(formData.targetSectors),
        scheduledFor: formData.scheduledFor && formData.scheduledFor.trim() !== '' 
          ? formData.scheduledFor // Enviar apenas a data YYYY-MM-DD
          : null,
        expiresAt: formData.expiresAt && formData.expiresAt.trim() !== '' 
          ? formData.expiresAt // Enviar apenas a data YYYY-MM-DD
          : null,
      }

      console.log('📝 Enviando dados para criar aviso:', submitData)

      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        console.log('✅ Aviso criado com sucesso')
        onNoticeCreated?.()
        handleClose(false)
      } else {
        const error = await response.json()
        console.error('❌ Erro ao criar aviso:', error.error)
        alert('Erro ao criar aviso: ' + error.error)
      }
    } catch (error) {
      console.error('❌ Erro ao criar aviso:', error)
      alert('Erro ao criar aviso')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        title: "",
        content: "",
        type: "",
        priority: "",
        level: "general",
        targetSectors: [],
        customSector: "",
        scheduledFor: "",
        expiresAt: "",
      })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden border-0 p-0 gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">
          Criar Novo Aviso
        </DialogTitle>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Criar Aviso Avançado</h2>
                <p className="text-white/90 text-sm">Sistema completo de avisos programáveis</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClose(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            
            {/* Título */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Título do Aviso <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Manutenção programada, Nova versão disponível..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Tipo do Aviso */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Tipo do Aviso <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {noticeTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        formData.type === type.value 
                          ? `border-blue-500 bg-blue-50` 
                          : `border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50`
                      }`}
                      onClick={() => handleInputChange("type", type.value)}
                    >
                      {formData.type === type.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Conteúdo do Aviso <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Descreva o aviso com detalhes..."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="min-h-32 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Grid de Configurações */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Prioridade */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Prioridade <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.priority === priority.value 
                          ? priority.color
                          : `border-gray-200 bg-white hover:${priority.color.replace('border-', 'border-').replace('bg-', 'bg-').replace('text-', 'text-')}`
                      }`}
                      onClick={() => handleInputChange("priority", priority.value)}
                    >
                      <div className="font-semibold">{priority.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Setores Alvo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                <Target className="w-4 h-4 inline mr-2" />
                Setores Alvo
              </Label>
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {sectors.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        formData.targetSectors.includes(sector)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                      }`}
                      onClick={() => handleSectorToggle(sector)}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
                
                {/* Setor Customizado */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Setor personalizado..."
                    value={formData.customSector}
                    onChange={(e) => handleInputChange("customSector", e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSector())}
                  />
                  <Button type="button" onClick={addCustomSector} variant="outline">
                    Adicionar
                  </Button>
                </div>

                {/* Setores Selecionados */}
                {formData.targetSectors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">Setores selecionados:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.targetSectors.map((sector) => (
                        <div key={sector} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm">
                          <span>{sector}</span>
                          <button
                            type="button"
                            onClick={() => removeSector(sector)}
                            className="hover:bg-blue-200 rounded p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Programação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Data de Publicação */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Programar Publicação
                </Label>
                <Input
                  type="date"
                  value={formData.scheduledFor}
                  onChange={(e) => handleInputChange("scheduledFor", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Deixe vazio para publicar imediatamente</p>
              </div>

              {/* Data de Expiração */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Data de Expiração
                </Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                  min={formData.scheduledFor || new Date().toISOString().split('T')[0]}
                  className="border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Deixe vazio para não expirar automaticamente</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="h-11 px-6"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!formData.title || !formData.content || !formData.type || !formData.priority || isLoading}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Aviso'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}