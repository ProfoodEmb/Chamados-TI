"use client"

import { useState, useRef } from "react"
import { Paperclip, X, Upload, Clock, AlertCircle, AlertTriangle, Zap, ArrowLeft } from "lucide-react"
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

interface TicketFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sistemaId: string
  sistemaNome: string
  onSubmit: (data: TicketFormData) => void
  onBack?: () => void
}

export interface TicketFormData {
  sistemaId: string
  sistemaNome: string
  assunto: string
  descricao: string
  urgencia: string
  tela: string
  mensagemErro: string
  attachments: File[]
}

const problemasComuns: Record<string, string[]> = {
  ecalc: [
    "Sistema não abre",
    "Erro ao fazer login",
    "Relatório não gera",
    "Dados não salvam",
    "Lentidão no sistema",
    "Outro problema",
  ],
  idsecure: [
    "Problema com acesso",
    "Erro de autenticação",
    "Configuração de permissões",
    "Outro problema",
  ],
  mercos: [
    "Pedido não sincroniza",
    "Erro ao enviar pedido",
    "Problema com catálogo",
    "Outro problema",
  ],
  ploomes: [
    "CRM não carrega",
    "Erro ao criar oportunidade",
    "Problema com integração",
    "Outro problema",
  ],
  questor: [
    "Sistema não abre",
    "Erro ao emitir nota",
    "Problema com estoque",
    "Relatório não gera",
    "Outro problema",
  ],
  sankhya: [
    "Sistema não abre",
    "Erro ao processar",
    "Problema com módulo",
    "Outro problema",
  ],
  estoque: [
    "Sistema não abre",
    "Erro ao dar entrada",
    "Problema com saldo",
    "Outro problema",
  ],
  // Automações
  dogking: [
    "Automação não executa",
    "Erro na integração",
    "Dados não sincronizam",
    "Outro problema",
  ],
  ploomes_auto: [
    "Automação não executa",
    "Erro no fluxo",
    "Dados não sincronizam",
    "Outro problema",
  ],
  thebestacai: [
    "Automação não executa",
    "Erro na integração",
    "Pedidos não sincronizam",
    "Outro problema",
  ],
}

const sistemasLogos: Record<string, string> = {
  ecalc: "/sistemas/ecalc.png",
  idsecure: "/sistemas/idsecure.jpg",
  mercos: "/sistemas/mercos.png",
  ploomes: "/sistemas/ploomes.png",
  questor: "/sistemas/questor.png",
  sankhya: "/sistemas/sankhya.png",
  estoque: "/sistemas/estoque.png",
  // Automações
  dogking: "/sistemas/dogking.png",
  ploomes_auto: "/sistemas/ploomes.png",
  thebestacai: "/sistemas/thebestacai.png",
}

const sistemasCores: Record<string, { from: string; to: string; button: string }> = {
  ecalc: { from: "from-orange-600", to: "to-orange-500", button: "bg-orange-600 hover:bg-orange-700" },
  idsecure: { from: "from-red-600", to: "to-red-500", button: "bg-red-600 hover:bg-red-700" },
  mercos: { from: "from-purple-600", to: "to-green-500", button: "bg-purple-600 hover:bg-purple-700" },
  ploomes: { from: "from-purple-600", to: "to-purple-500", button: "bg-purple-600 hover:bg-purple-700" },
  questor: { from: "from-orange-600", to: "to-orange-500", button: "bg-orange-600 hover:bg-orange-700" },
  sankhya: { from: "from-green-600", to: "to-green-500", button: "bg-green-600 hover:bg-green-700" },
  estoque: { from: "from-amber-700", to: "to-amber-600", button: "bg-amber-700 hover:bg-amber-800" },
  // Automações
  dogking: { from: "from-yellow-600", to: "to-yellow-500", button: "bg-yellow-600 hover:bg-yellow-700" },
  ploomes_auto: { from: "from-purple-600", to: "to-purple-500", button: "bg-purple-600 hover:bg-purple-700" },
  thebestacai: { from: "from-pink-600", to: "to-pink-500", button: "bg-pink-600 hover:bg-pink-700" },
}

export function TicketFormDialog({ 
  open, 
  onOpenChange, 
  sistemaId,
  sistemaNome,
  onSubmit,
  onBack
}: TicketFormDialogProps) {
  const [formData, setFormData] = useState({
    assunto: "",
    descricao: "",
    urgencia: "",
    tela: "",
    mensagemErro: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const problemas = problemasComuns[sistemaId] || problemasComuns.estoque
  const sistemaLogo = sistemasLogos[sistemaId]
  const sistemaCor = sistemasCores[sistemaId] || { from: "from-blue-600", to: "to-blue-500", button: "bg-blue-600 hover:bg-blue-700" }

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
    
    if (!formData.assunto || !formData.descricao || !formData.urgencia) {
      return
    }

    onSubmit({
      sistemaId,
      sistemaNome,
      assunto: formData.assunto,
      descricao: formData.descricao,
      urgencia: formData.urgencia,
      tela: formData.tela,
      mensagemErro: formData.mensagemErro,
      attachments,
    })

    setFormData({
      assunto: "",
      descricao: "",
      urgencia: "",
      tela: "",
      mensagemErro: "",
    })
    setAttachments([])
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        assunto: "",
        descricao: "",
        urgencia: "",
        tela: "",
        mensagemErro: "",
      })
      setAttachments([])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">
          Novo Chamado - {sistemaNome}
        </DialogTitle>
        
        {/* Header com cor do sistema */}
        <div className={`bg-gradient-to-r ${sistemaCor.from} ${sistemaCor.to} p-6 text-white rounded-t-lg`}>
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
            {sistemaLogo && (
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center p-2">
                <Image
                  src={sistemaLogo}
                  alt={sistemaNome}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">Novo Chamado</h2>
              <p className="text-white/90 text-sm">Suporte Técnico - {sistemaNome}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            
            {/* Qual o problema */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Qual o problema? <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.assunto} 
                onValueChange={(value) => handleInputChange("assunto", value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Selecione o tipo de problema..." />
                </SelectTrigger>
                <SelectContent>
                  {problemas.map((problema) => (
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
                placeholder="Descreva com detalhes:&#10;- O que você estava fazendo?&#10;- Quando começou?&#10;- Qual o impacto no seu trabalho?"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                className="min-h-[120px] border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Tela/Módulo e Mensagem de Erro - Lado a Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  Tela/Módulo <span className="text-gray-400 text-sm font-normal">(opcional)</span>
                </Label>
                <Input
                  placeholder="Ex: Cadastro de Produtos"
                  value={formData.tela}
                  onChange={(e) => handleInputChange("tela", e.target.value)}
                  className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  Mensagem de erro <span className="text-gray-400 text-sm font-normal">(opcional)</span>
                </Label>
                <Input
                  placeholder="Cole a mensagem de erro"
                  value={formData.mensagemErro}
                  onChange={(e) => handleInputChange("mensagemErro", e.target.value)}
                  className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

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
                    description: "Sistema parado"
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
                  Prints, documentos ou logs que ajudem
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt,.log"
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
              disabled={!formData.assunto || !formData.descricao || !formData.urgencia}
              className={`h-11 px-6 ${sistemaCor.button}`}
            >
              Criar Chamado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
