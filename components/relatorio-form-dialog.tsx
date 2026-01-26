"use client"

import { useState, useRef } from "react"
import { Paperclip, X, Upload, FileText } from "lucide-react"
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

interface RelatorioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RelatorioFormData) => void
}

export interface RelatorioFormData {
  tipoRelatorio: string
  titulo: string
  descricao: string
  prazo: string
  formato: string
  attachments: File[]
}

const tiposRelatorio = [
  "Relatório de vendas",
  "Relatório financeiro",
  "Relatório de estoque",
  "Relatório de clientes",
  "Relatório de comissões",
  "Relatório personalizado",
  "Outro relatório",
]

const prazos = [
  { value: "urgente", label: "Urgente (até 24h)" },
  { value: "rapido", label: "Rápido (2-3 dias)" },
  { value: "normal", label: "Normal (1 semana)" },
  { value: "flexivel", label: "Flexível (sem pressa)" },
]

const formatos = [
  { value: "excel", label: "Excel (.xlsx)" },
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "outro", label: "Outro formato" },
]

export function RelatorioFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: RelatorioFormDialogProps) {
  const [formData, setFormData] = useState({
    tipoRelatorio: "",
    titulo: "",
    descricao: "",
    prazo: "",
    formato: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    
    if (!formData.tipoRelatorio || !formData.titulo || !formData.descricao || !formData.prazo || !formData.formato) {
      return
    }

    onSubmit({
      tipoRelatorio: formData.tipoRelatorio,
      titulo: formData.titulo,
      descricao: formData.descricao,
      prazo: formData.prazo,
      formato: formData.formato,
      attachments,
    })

    setFormData({
      tipoRelatorio: "",
      titulo: "",
      descricao: "",
      prazo: "",
      formato: "",
    })
    setAttachments([])
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        tipoRelatorio: "",
        titulo: "",
        descricao: "",
        prazo: "",
        formato: "",
      })
      setAttachments([])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 gap-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">
          Solicitação de Relatório
        </DialogTitle>
        
        {/* Header Azul */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Solicitação de Relatório</h2>
              <p className="text-white/90 text-sm">Preencha os dados do relatório que você precisa</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            
            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Tipo de relatório <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.tipoRelatorio} 
                onValueChange={(value) => handleInputChange("tipoRelatorio", value)}
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Selecione o tipo de relatório..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelatorio.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título do Relatório */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Título do relatório <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Relatório de vendas por região - Janeiro 2026"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                className="h-12 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Descrição detalhada <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Descreva com detalhes:&#10;- Quais informações você precisa?&#10;- Qual período deve cobrir?&#10;- Quais filtros ou agrupamentos são necessários?&#10;- Como você pretende usar este relatório?"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                className="min-h-[140px] border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Prazo e Formato - Lado a Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  Prazo <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.prazo} 
                  onValueChange={(value) => handleInputChange("prazo", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Quando você precisa?" />
                  </SelectTrigger>
                  <SelectContent>
                    {prazos.map((prazo) => (
                      <SelectItem key={prazo.value} value={prazo.value}>
                        {prazo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">
                  Formato <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.formato} 
                  onValueChange={(value) => handleInputChange("formato", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Formato desejado" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatos.map((formato) => (
                      <SelectItem key={formato.value} value={formato.value}>
                        {formato.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Anexos */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Anexos <span className="text-gray-400 text-sm font-normal">(opcional)</span>
              </Label>
              <p className="text-sm text-gray-500">
                Adicione exemplos, layouts ou documentos que ajudem a entender o que você precisa
              </p>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  Clique para adicionar arquivos
                </p>
                <p className="text-sm text-gray-500">
                  Exemplos, layouts ou documentos de referência
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xlsx,.xls"
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
              disabled={!formData.tipoRelatorio || !formData.titulo || !formData.descricao || !formData.prazo || !formData.formato}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
            >
              Solicitar Relatório
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
