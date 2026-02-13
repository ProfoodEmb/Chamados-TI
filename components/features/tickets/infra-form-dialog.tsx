"use client"

import { useState, useRef } from "react"
import { Paperclip, X, Upload, Clock, AlertCircle, AlertTriangle, Zap, Printer, HelpCircle, Wrench, Wifi, ArrowLeft, DollarSign, Database, Server, Phone } from "lucide-react"
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
  requesterId?: string
  userRole?: string
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

const problemasServidores = [
  "Servidor não responde",
  "Servidor lento",
  "Erro de acesso ao servidor",
  "Problema com compartilhamento de arquivos",
  "Outros",
]

const problemasRamal = [
  "Ramal não funciona",
  "Sem sinal de telefone",
  "Não consigo fazer ligações",
  "Não consigo receber ligações",
  "Problema com transferência de chamadas",
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
    if (preSelectedCategory === "Servidores") return problemasServidores
    if (preSelectedCategory === "Ramal") return problemasRamal
    return problemasOutros
  }

  const problemasDisponiveis = getProblemasDisponiveis()

  const getTitulo = () => {
    if (preSelectedCategory === "Impressora") return "Impressora"
    if (preSelectedCategory === "Orçamento") return "Orçamento"
    if (preSelectedCategory === "Manutenção") return "Manutenção"
    if (preSelectedCategory === "Rede e conectividade") return "Wi-Fi"
    if (preSelectedCategory === "Servidores") return "Servidores"
    if (preSelectedCategory === "Ramal") return "Ramal"
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
    
    // Para orçamento, Wi-Fi, Servidores e Ramal, não exigir patrimônio
    const isPatrimonioRequired = preSelectedCategory !== "Orçamento" && 
                                  preSelectedCategory !== "Rede e conectividade" &&
                                  preSelectedCategory !== "Servidores" &&
                                  preSelectedCategory !== "Ramal"
    
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
        
        {/* Header com visual especial para impressora */}
        {preSelectedCategory === "Impressora" ? (
          <div className="relative h-32 overflow-hidden">
            {/* Imagem de impressora no fundo */}
            <div className="absolute inset-0">
              <img 
                src="/infra/impressora.png" 
                alt="Impressora"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Overlay leve para melhorar legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-800/40" />
            
            <div className="relative p-6 text-white flex items-center gap-4">
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
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Printer className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold drop-shadow-lg">Novo Chamado</h2>
                <p className="text-white/95 text-base drop-shadow">Suporte Técnico - Impressora</p>
              </div>
            </div>
          </div>
        ) : preSelectedCategory === "Orçamento" ? (
          /* Header especial para orçamento */
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
            {/* Símbolos de $ espalhados no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-12 text-green-200 text-4xl font-bold opacity-40">$</div>
              <div className="absolute top-8 right-20 text-green-300 text-3xl font-bold opacity-30">$</div>
              <div className="absolute bottom-6 left-32 text-emerald-200 text-5xl font-bold opacity-25">$</div>
              <div className="absolute top-12 left-64 text-green-200 text-2xl font-bold opacity-35">$</div>
              <div className="absolute bottom-8 right-40 text-emerald-300 text-4xl font-bold opacity-30">$</div>
              <div className="absolute top-6 right-64 text-green-200 text-3xl font-bold opacity-25">$</div>
              
              {/* Mini nota de dinheiro decorativa */}
              <div className="absolute bottom-4 right-8 w-20 h-12 bg-green-600 rounded-md shadow-lg opacity-20 border-2 border-green-700">
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">$</div>
              </div>
            </div>
            
            <div className="relative p-6 text-green-900 flex items-center gap-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 text-green-700 hover:bg-green-200/50 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                <DollarSign className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-800">Novo Chamado</h2>
                <p className="text-green-700 text-base">Suporte Técnico - Orçamento</p>
              </div>
            </div>
          </div>
        ) : preSelectedCategory === "Manutenção" ? (
          /* Header especial para manutenção */
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-slate-200">
            {/* Engrenagens e ferramentas espalhadas no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Engrenagens - mais quantidade */}
              <div className="absolute top-6 left-16 text-gray-400 opacity-30">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
              </div>
              <div className="absolute bottom-4 right-24 text-slate-400 opacity-25">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
              </div>
              <div className="absolute top-2 right-40 text-gray-500 opacity-20">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
              </div>
              <div className="absolute bottom-10 left-56 text-slate-500 opacity-15">
                <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
              </div>
              <div className="absolute top-16 left-72 text-gray-400 opacity-25">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
              </div>
              
              {/* Chaves inglesas - mais quantidade */}
              <div className="absolute top-8 right-16 text-gray-500 opacity-25 transform rotate-45">
                <Wrench className="w-14 h-14" />
              </div>
              <div className="absolute bottom-6 left-8 text-slate-500 opacity-20 transform -rotate-30">
                <Wrench className="w-10 h-10" />
              </div>
              <div className="absolute top-4 left-44 text-gray-600 opacity-15 transform rotate-90">
                <Wrench className="w-12 h-12" />
              </div>
              
              {/* Martelos - mais quantidade */}
              <div className="absolute bottom-8 left-40 text-slate-500 opacity-20 transform -rotate-12">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 19.63L13.43 8.2l2.12 2.12L4.12 21.75 2 19.63M6 18l2-2 2 2-2 2-2-2m14.25-11.25L15.5 11.5l-2.12-2.12 4.75-4.75c.39-.39 1.04-.39 1.43 0l.69.69c.39.39.39 1.04 0 1.43M20.5 5.5L19 7l-2-2 1.5-1.5c.39-.39 1.04-.39 1.43 0l.57.57c.39.39.39 1.04 0 1.43z"/>
                </svg>
              </div>
              <div className="absolute top-10 right-52 text-gray-500 opacity-18 transform rotate-25">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 19.63L13.43 8.2l2.12 2.12L4.12 21.75 2 19.63M6 18l2-2 2 2-2 2-2-2m14.25-11.25L15.5 11.5l-2.12-2.12 4.75-4.75c.39-.39 1.04-.39 1.43 0l.69.69c.39.39.39 1.04 0 1.43M20.5 5.5L19 7l-2-2 1.5-1.5c.39-.39 1.04-.39 1.43 0l.57.57c.39.39.39 1.04 0 1.43z"/>
                </svg>
              </div>
              
              {/* Chaves de fenda - mais quantidade */}
              <div className="absolute top-12 left-52 text-gray-400 opacity-30 transform rotate-90">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 10.5L19 9l-1.5 1.5L19 12l1.5-1.5M18 2l-1.5 1.5L18 5l1.5-1.5L18 2M7 22H5v-2h2v2m4 0H9v-2h2v2m4 0h-2v-2h2v2m6-10h-2v2h2v-2m0 4h-2v2h2v-2m0 4h-2v2h2v-2M3 14H1v2h2v-2m0 4H1v2h2v-2m0-8H1v2h2v-2m14-4.5L15.5 7 14 5.5 15.5 4 17 5.5M3 10H1v2h2v-2z"/>
                </svg>
              </div>
              <div className="absolute bottom-2 right-12 text-slate-400 opacity-22 transform -rotate-45">
                <svg className="w-11 h-11" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 10.5L19 9l-1.5 1.5L19 12l1.5-1.5M18 2l-1.5 1.5L18 5l1.5-1.5L18 2M7 22H5v-2h2v2m4 0H9v-2h2v2m4 0h-2v-2h2v2m6-10h-2v2h2v-2m0 4h-2v2h2v-2m0 4h-2v2h2v-2M3 14H1v2h2v-2m0 4H1v2h2v-2m0-8H1v2h2v-2m14-4.5L15.5 7 14 5.5 15.5 4 17 5.5M3 10H1v2h2v-2z"/>
                </svg>
              </div>
              <div className="absolute top-3 right-6 text-gray-500 opacity-20 transform rotate-135">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 10.5L19 9l-1.5 1.5L19 12l1.5-1.5M18 2l-1.5 1.5L18 5l1.5-1.5L18 2M7 22H5v-2h2v2m4 0H9v-2h2v2m4 0h-2v-2h2v2m6-10h-2v2h2v-2m0 4h-2v2h2v-2m0 4h-2v2h2v-2M3 14H1v2h2v-2m0 4H1v2h2v-2m0-8H1v2h2v-2m14-4.5L15.5 7 14 5.5 15.5 4 17 5.5M3 10H1v2h2v-2z"/>
                </svg>
              </div>
            </div>
            
            <div className="relative p-6 text-gray-800 flex items-center gap-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 text-gray-700 hover:bg-gray-300/50 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-16 h-16 bg-slate-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Wrench className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-700">Novo Chamado</h2>
                <p className="text-slate-600 text-base">Suporte Técnico - Manutenção</p>
              </div>
            </div>
          </div>
        ) : preSelectedCategory === "Rede e conectividade" ? (
          /* Header especial para Wi-Fi */
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
            {/* Padrão de ondas de Wi-Fi no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Ondas concêntricas grandes e suaves */}
              <div className="absolute -top-10 -right-10 w-40 h-40 border-4 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute -top-5 -right-5 w-32 h-32 border-4 border-blue-300 rounded-full opacity-25"></div>
              <div className="absolute top-0 right-0 w-24 h-24 border-4 border-blue-400 rounded-full opacity-30"></div>
              
              <div className="absolute -bottom-8 -left-8 w-36 h-36 border-4 border-indigo-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-28 h-28 border-4 border-indigo-300 rounded-full opacity-25"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-4 border-indigo-400 rounded-full opacity-30"></div>
              
              {/* Ícones de Wi-Fi sutis */}
              <div className="absolute top-8 right-32 text-blue-300 opacity-15">
                <Wifi className="w-20 h-20" />
              </div>
              <div className="absolute bottom-6 left-40 text-indigo-300 opacity-12">
                <Wifi className="w-16 h-16" />
              </div>
              
              {/* Pontos de conexão */}
              <div className="absolute top-12 left-64 w-3 h-3 bg-blue-400 rounded-full opacity-30"></div>
              <div className="absolute top-20 left-72 w-2 h-2 bg-indigo-400 rounded-full opacity-25"></div>
              <div className="absolute bottom-10 right-48 w-2.5 h-2.5 bg-sky-400 rounded-full opacity-28"></div>
              <div className="absolute top-6 right-56 w-2 h-2 bg-blue-300 rounded-full opacity-22"></div>
            </div>
            
            <div className="relative p-6 text-blue-900 flex items-center gap-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 text-blue-700 hover:bg-blue-200/50 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Wifi className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-blue-800">Novo Chamado</h2>
                <p className="text-blue-700 text-base">Suporte Técnico - Wi-Fi</p>
              </div>
            </div>
          </div>
        ) : preSelectedCategory === "Servidores" ? (
          /* Header especial para Servidores */
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900">
            {/* Padrão de servidores e racks no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Linhas de dados/conexões */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
              <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
              <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent"></div>
              <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
              
              {/* Ícones de servidor/database sutis */}
              <div className="absolute top-6 right-16 text-cyan-500 opacity-10">
                <Database className="w-20 h-20" />
              </div>
              <div className="absolute bottom-4 left-20 text-blue-500 opacity-8">
                <Database className="w-16 h-16" />
              </div>
              <div className="absolute top-12 left-56 text-cyan-400 opacity-12">
                <Server className="w-14 h-14" />
              </div>
              
              {/* Pontos de LED/status */}
              <div className="absolute top-10 left-12 flex gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-40 animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <div className="absolute bottom-12 right-24 flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-35 animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-35 animate-pulse" style={{animationDelay: '0.3s'}}></div>
              </div>
              
              {/* Retângulos representando racks de servidor */}
              <div className="absolute top-4 right-40 w-12 h-16 border border-cyan-500/20 rounded opacity-15">
                <div className="w-full h-1 bg-cyan-500/30 mt-2"></div>
                <div className="w-full h-1 bg-cyan-500/30 mt-2"></div>
                <div className="w-full h-1 bg-blue-500/30 mt-2"></div>
              </div>
              <div className="absolute bottom-6 left-48 w-10 h-14 border border-blue-500/20 rounded opacity-12">
                <div className="w-full h-1 bg-blue-500/30 mt-1.5"></div>
                <div className="w-full h-1 bg-cyan-500/30 mt-1.5"></div>
                <div className="w-full h-1 bg-blue-500/30 mt-1.5"></div>
              </div>
              
              {/* Efeito de brilho sutil */}
              <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
            </div>
            
            <div className="relative p-6 text-white flex items-center gap-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 text-white hover:bg-white/10 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-900/50">
                <Database className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold drop-shadow-lg">Novo Chamado</h2>
                <p className="text-cyan-100 text-base drop-shadow">Suporte Técnico - Servidores</p>
              </div>
            </div>
          </div>
        ) : preSelectedCategory === "Ramal" ? (
          /* Header especial para Ramal */
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
            {/* Padrão de telefonia e ondas sonoras no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Ondas sonoras concêntricas */}
              <div className="absolute top-1/2 left-12 -translate-y-1/2">
                <div className="w-16 h-16 border-2 border-purple-300 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-purple-400 rounded-full opacity-25"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-purple-500 rounded-full opacity-30"></div>
              </div>
              
              <div className="absolute top-1/2 right-16 -translate-y-1/2">
                <div className="w-20 h-20 border-2 border-violet-300 rounded-full opacity-18"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-2 border-violet-400 rounded-full opacity-22"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-violet-500 rounded-full opacity-28"></div>
              </div>
              
              {/* Ícones de telefone sutis */}
              <div className="absolute top-8 right-40 text-purple-300 opacity-12">
                <Phone className="w-16 h-16" />
              </div>
              <div className="absolute bottom-6 left-48 text-violet-300 opacity-10">
                <Phone className="w-14 h-14" />
              </div>
              
              {/* Linhas de conexão */}
              <div className="absolute top-12 left-32 w-24 h-px bg-gradient-to-r from-purple-300/30 to-transparent"></div>
              <div className="absolute bottom-10 right-32 w-20 h-px bg-gradient-to-l from-violet-300/30 to-transparent"></div>
              
              {/* Pontos de sinal */}
              <div className="absolute top-16 left-64 flex gap-1.5">
                <div className="w-1 h-3 bg-purple-400 rounded-full opacity-30"></div>
                <div className="w-1 h-4 bg-purple-400 rounded-full opacity-35"></div>
                <div className="w-1 h-5 bg-purple-500 rounded-full opacity-40"></div>
              </div>
              <div className="absolute bottom-8 right-56 flex gap-1.5">
                <div className="w-1 h-3 bg-violet-400 rounded-full opacity-28"></div>
                <div className="w-1 h-4 bg-violet-400 rounded-full opacity-32"></div>
                <div className="w-1 h-5 bg-violet-500 rounded-full opacity-38"></div>
              </div>
            </div>
            
            <div className="relative p-6 text-purple-900 flex items-center gap-4">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-10 w-10 text-purple-700 hover:bg-purple-200/50 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Phone className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-purple-800">Novo Chamado</h2>
                <p className="text-purple-700 text-base">Suporte Técnico - Ramal</p>
              </div>
            </div>
          </div>
        ) : (
          /* Header padrão para outras categorias */
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
        )}

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

            {/* Patrimônio da Impressora ou Código do Equipamento - Não mostrar para Orçamento, Wi-Fi, Servidores e Ramal */}
            {preSelectedCategory !== "Orçamento" && 
             preSelectedCategory !== "Rede e conectividade" && 
             preSelectedCategory !== "Servidores" &&
             preSelectedCategory !== "Ramal" && (
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
                (preSelectedCategory !== "Orçamento" && 
                 preSelectedCategory !== "Rede e conectividade" && 
                 preSelectedCategory !== "Servidores" &&
                 preSelectedCategory !== "Ramal" && 
                 !formData.patrimonio)
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
