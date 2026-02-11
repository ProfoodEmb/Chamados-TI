"use client"

import { useState, useRef } from "react"
import { Paperclip, X, Upload, Clock, AlertCircle, AlertTriangle, Zap, Printer, HelpCircle, Wrench, Wifi, ArrowLeft, DollarSign } from "lucide-react"
import Image from "next/image"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InfraFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: InfraFormData) => void
  preSelectedCategory?: string
  onBack?: () => void
}

export interface InfraFormData {
  problema: string
  descricao: string
  patrimonio?: string
  urgencia: string
  attachments: File[]
}

const problemasImpressora = [
  "Impressora não imprime",
  "Papel atolado",
  "Impressora offline",
  "Qualidade de impressão ruim",
  "Não conecta ao Wi-Fi",
  "Preciso configurar impressora Wi-Fi",
  "Impressão falhada",
  "Outros",
]

const problemasOrcamento = [
  "Preciso de orçamento para equipamento",
  "Preciso de orçamento para software",
  "Preciso de orçamento para serviço",
  "Outros",
]

const problemasManutencao = [
  "Parou de funcionar",
  "Equipamento danificou",
  "Outros",
]

const problemasWifi = [
  "Sem acesso à internet",
  "Internet lenta",
  "Não conecta ao Wi-Fi",
  "Cabo de rede com problema",
  "Outros",
]

const problemasOutros = [
  "Computador não liga",
  "Computador lento",
  "Tela com problema",
  "Teclado ou mouse com defeito",
  "Ramal não funciona",
  "Sem sinal de telefone",
  "Esqueci minha senha",
  "Preciso de acesso a pasta/sistema",
  "Não consigo enviar e-mails",
  "Não recebo e-mails",
  "Preciso recuperar arquivo",
  "Outros",
]

export function InfraFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  preSelectedCategory = "",
  onBack
}: InfraFormDialogProps) {
  const [formData, setFormData] = useState({
    problema: "",
    descricao: "",
    patrimonio: "",
    urgencia: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [showPatrimonioGuide, setShowPatrimonioGuide] = useState(false)
  const [showEquipamentoGuide, setShowEquipamentoGuide] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determinar qual lista de problemas mostrar baseado na categoria pré-selecionada
  const getProblemasDisponiveis = () => {
    if (preSelectedCategory === "Impressora") return problemasImpressora
    if (preSelectedCategory === "Orçamento") return problemasOrcamento
    if (preSelectedCategory === "Manutenção") return problemasManutencao
    if (preSelectedCategory === "Rede e conectividade") return problemasWifi
    return problemasOutros
  }

  const problemasDisponiveis = getProblemasDisponiveis()

  const getTitulo = () => {
    if (preSelectedCategory === "Impressora") return "Impressora"
    if (preSelectedCategory === "Orçamento") return "Orçamento"
    if (preSelectedCategory === "Manutenção") return "Manutenção"
    if (preSelectedCategory === "Rede e conectividade") return "Wi-Fi"
    return "Infraestrutura"
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Para orçamento e Wi-Fi, não exigir patrimônio
    const isPatrimonioRequired = preSelectedCategory !== "Orçamento" && preSelectedCategory !== "Rede e conectividade"
    
    if (!formData.problema || !formData.descricao || !formData.urgencia || (isPatrimonioRequired && !formData.patrimonio)) {
      return
    }

    onSubmit({
      problema: formData.problema,
      descricao: formData.descricao,
      patrimonio: formData.patrimonio,
      urgencia: formData.urgencia,
      attachments,
    })

    setFormData({
      problema: "",
      descricao: "",
      patrimonio: "",
      urgencia: "",
    })
    setAttachments([])
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        problema: "",
        descricao: "",
        patrimonio: "",
        urgencia: "",
      })
      setAttachments([])
      setShowPatrimonioGuide(false)
      setShowEquipamentoGuide(false)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-hidden border-0 p-0 gap-0">
        <DialogTitle className="sr-only">
          Novo Chamado - {getTitulo()}
        </DialogTitle>
        
        {/* Header com gradiente azul */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 text-white hover:bg-white/20 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {preSelectedCategory === "Manutenção" ? (
                <Wrench className="w-8 h-8 text-white" />
              ) : preSelectedCategory === "Rede e conectividade" ? (
                <Wifi className="w-8 h-8 text-white" />
              ) : preSelectedCategory === "Orçamento" ? (
                <DollarSign className="w-8 h-8 text-white" />
              ) : (
                <Printer className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Novo Chamado</h2>
              <p className="text-white/90 text-sm">Suporte Técnico - {getTitulo()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-6 space-y-6">
            
            {/* Qual o problema */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Qual o problema? <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.problema} 
                onValueChange={(value) => handleInputChange("problema", value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Selecione o tipo de problema..." />
                </SelectTrigger>
                <SelectContent>
                  {problemasDisponiveis.map((problema) => (
                    <SelectItem key={problema} value={problema}>
                      {problema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição Detalhada */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Descrição detalhada <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Descreva com detalhes:&#10;- O que aconteceu?&#10;- Quando começou?&#10;- Já tentou alguma solução?&#10;- Qual o impacto no seu trabalho?"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                className="min-h-[120px] border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Patrimônio da Impressora ou Código do Equipamento - Não mostrar para Orçamento e Wi-Fi */}
            {preSelectedCategory !== "Orçamento" && preSelectedCategory !== "Rede e conectividade" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold text-gray-700">
                    {preSelectedCategory === "Manutenção" 
                      ? "Código do equipamento" 
                      : "Patrimônio da impressora"} <span className="text-red-500">*</span>
                  </Label>
                    <button
                      type="button"
                      onClick={() => {
                        if (preSelectedCategory === "Manutenção") {
                          setShowEquipamentoGuide(!showEquipamentoGuide)
                        } else {
                          setShowPatrimonioGuide(!showPatrimonioGuide)
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title={preSelectedCategory === "Manutenção" 
                        ? "Ver exemplo de onde encontrar o código" 
                        : "Ver exemplo de onde encontrar o patrimônio"}
                    >
                      <HelpCircle className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showPatrimonioGuide && preSelectedCategory !== "Manutenção" && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Onde encontrar o patrimônio?</h4>
                          <p className="text-sm text-blue-700">
                            O número do patrimônio geralmente está em uma etiqueta colada na impressora.
                          </p>
                        </div>
                      </div>
                      <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border-2 border-blue-300">
                        <Image
                          src="/patrimonio-impressora.jpeg"
                          alt="Exemplo de onde encontrar o patrimônio da impressora"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {showEquipamentoGuide && preSelectedCategory === "Manutenção" && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Onde encontrar o código?</h4>
                          <p className="text-sm text-blue-700">
                            O código do equipamento geralmente está em uma etiqueta colada no equipamento.
                          </p>
                        </div>
                      </div>
                      <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border-2 border-blue-300">
                        <Image
                          src="/etiqueta de equipamento.jpeg"
                          alt="Exemplo de onde encontrar o código do equipamento"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  <Input
                    placeholder={preSelectedCategory === "Manutenção" 
                      ? "Digite o código do equipamento" 
                      : "Numero do Patrimio da impressora"}
                    value={formData.patrimonio}
                    onChange={(e) => handleInputChange("patrimonio", e.target.value)}
                    className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
            )}

            {/* Nível de Urgência */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Nível de Urgência <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { 
                    value: "low", 
                    label: "Baixa",
                    icon: Clock,
                    borderColor: "border-green-300",
                    selectedBorder: "border-green-500",
                    bgColor: "bg-green-50",
                    iconColor: "text-green-600",
                    description: "Não impede o trabalho"
                  },
                  { 
                    value: "medium", 
                    label: "Média",
                    icon: AlertCircle,
                    borderColor: "border-yellow-300",
                    selectedBorder: "border-yellow-500",
                    bgColor: "bg-yellow-50",
                    iconColor: "text-yellow-600",
                    description: "Há alternativas"
                  },
                  { 
                    value: "high", 
                    label: "Alta",
                    icon: AlertTriangle,
                    borderColor: "border-orange-300",
                    selectedBorder: "border-orange-500",
                    bgColor: "bg-orange-50",
                    iconColor: "text-orange-600",
                    description: "Impede parte do trabalho"
                  },
                  { 
                    value: "critical", 
                    label: "Crítica",
                    icon: Zap,
                    borderColor: "border-red-300",
                    selectedBorder: "border-red-500",
                    bgColor: "bg-red-50",
                    iconColor: "text-red-600",
                    description: "Trabalho parado"
                  },
                ].map((urg) => {
                  const Icon = urg.icon
                  return (
                    <button
                      key={urg.value}
                      type="button"
                      className={`relative p-4 rounded-2xl border-2 transition-all ${
                        formData.urgencia === urg.value 
                          ? `${urg.selectedBorder} ${urg.bgColor}` 
                          : `${urg.borderColor} bg-white hover:${urg.bgColor}`
                      }`}
                      onClick={() => handleInputChange("urgencia", urg.value)}
                    >
                      {formData.urgencia === urg.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          formData.urgencia === urg.value ? urg.bgColor : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${formData.urgencia === urg.value ? urg.iconColor : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm ${
                            formData.urgencia === urg.value ? urg.iconColor : 'text-gray-700'
                          }`}>
                            {urg.label}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            formData.urgencia === urg.value ? urg.iconColor : 'text-gray-500'
                          }`}>
                            {urg.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Anexos */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Anexos <span className="text-gray-400 text-sm font-normal">(opcional)</span>
              </Label>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  Clique para adicionar arquivos
                </p>
                <p className="text-sm text-gray-500">
                  Fotos do problema, prints ou documentos
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={
                !formData.problema || 
                !formData.descricao || 
                !formData.urgencia ||
                (preSelectedCategory !== "Orçamento" && preSelectedCategory !== "Rede e conectividade" && !formData.patrimonio)
              }
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
            >
              Criar Chamado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
