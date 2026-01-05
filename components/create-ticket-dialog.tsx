"use client"

import { useState, useRef } from "react"
import { Plus, Paperclip, X, Server, Monitor, Bot, FileText, Wifi, DollarSign, Wrench, Printer } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sistemas (ERP + outros)
const listaSistemas = [
  { id: "ecalc", nome: "Ecalc", logo: "/sistemas/ecalc.png" },
  { id: "questor", nome: "Questor", logo: "/sistemas/questor.png" },
  { id: "sankhya", nome: "Sankhya", logo: "/sistemas/sankhya.png" },
  { id: "ploomes", nome: "Ploomes", logo: "/sistemas/ploomes.png" },
  { id: "mercos", nome: "Mercos", logo: "/sistemas/mercos.png" },
  { id: "rhid", nome: "RHID", logo: "/sistemas/rhid.png" },
  { id: "IDSecure", nome: "IDSecure", logo: "/sistemas/IDSecure.jpg" },
  { id: "estoque", nome: "Sistema de Estoque", logo: "/sistemas/estoque.png" },
]

// Automação
const listaAutomacao = [
  { id: "thebestacai", nome: "The Best Açaí", logo: "/sistemas/thebestacai.png" },
  { id: "ploomes_auto", nome: "Ploomes", logo: "/sistemas/ploomes.png" },
  { id: "dogking", nome: "Dog King", logo: "/sistemas/dogking.png" },
]

// Categorias de Infra
const categoriasInfra = [
  { id: "rede", nome: "Problemas de Rede", icon: Wifi },
  { id: "orcamentos", nome: "Orçamentos", icon: DollarSign },
  { id: "equipamento", nome: "Equipamento parou", icon: Wrench },
  { id: "impressora", nome: "Impressora", icon: Printer },
]

// Problemas comuns
const problemasComuns = {
  rede: [
    "Sem acesso à internet",
    "Lentidão na rede",
    "Wi-Fi não conecta",
    "Cabo de rede danificado",
    "Outro problema de rede",
  ],
  orcamentos: [
    "Orçamento de equipamento",
    "Orçamento de manutenção",
    "Orçamento de software",
    "Outro orçamento",
  ],
  equipamento: [
    "Computador não liga",
    "Monitor sem imagem",
    "Teclado/Mouse não funciona",
    "Notebook com defeito",
    "Outro equipamento",
  ],
  impressora: [
    "Impressora não imprime",
    "Impressora não conecta",
    "Papel atolado",
    "Outro problema de impressora",
  ],
  sistemas: [
    "Sistema não abre/trava",
    "Erro ao fazer login",
    "Relatório não gera",
    "Dados não salvam",
    "Tela em branco/erro",
    "Lentidão no sistema",
    "Permissão de acesso",
    "Integração com outro sistema",
    "Atualização de cadastro",
    "Outro problema de sistema",
  ],
  automacao: [
    "Sistema não abre/trava",
    "Erro ao fazer login",
    "Dados não sincronizam",
    "Problema com integração",
    "Lentidão no sistema",
    "Outro problema de automação",
  ],
  relatorios: [
    "Relatório de vendas",
    "Relatório financeiro",
    "Relatório de estoque",
    "Relatório de clientes",
    "Relatório de comissões",
    "Relatório personalizado",
    "Outro relatório",
  ],
}

interface CreateTicketDialogProps {
  onCreateTicket?: (ticket: {
    tipo: string
    categoria: string
    sistema: string
    problema: string
    subject: string
    description: string
    anydesk: string
    urgency: string
    attachments: File[]
  }) => void
}

export function CreateTicketDialog({ onCreateTicket }: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    tipo: "",
    categoria: "", // "sistemas" ou "automacao"
    sistema: "",
    problema: "",
    subject: "",
    description: "",
    anydesk: "",
    urgency: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tipo || !formData.problema || !formData.description || !formData.urgency) {
      return
    }
    if (formData.tipo === "sistemas" && (!formData.categoria || !formData.sistema)) {
      return
    }

    onCreateTicket?.({
      ...formData,
      subject: formData.problema.includes("Outro") ? formData.subject : formData.problema,
      attachments
    })
    
    setFormData({
      tipo: "",
      categoria: "",
      sistema: "",
      problema: "",
      subject: "",
      description: "",
      anydesk: "",
      urgency: "",
    })
    setAttachments([])
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "tipo" ? { categoria: "", sistema: "", problema: "", subject: "" } : {}),
      ...(field === "categoria" ? { sistema: "", problema: "", subject: "" } : {}),
      ...(field === "sistema" ? { problema: "", subject: "" } : {})
    }))
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

  // Determina quais problemas mostrar
  const getProblemasDisponiveis = () => {
    if (formData.tipo === "infra") {
      if (formData.categoria === "rede") return problemasComuns.rede
      if (formData.categoria === "orcamentos") return problemasComuns.orcamentos
      if (formData.categoria === "equipamento") return problemasComuns.equipamento
      if (formData.categoria === "impressora") return problemasComuns.impressora
    }
    if (formData.tipo === "sistemas") {
      if (formData.categoria === "sistemas") return problemasComuns.sistemas
      if (formData.categoria === "automacao") return problemasComuns.automacao
      if (formData.categoria === "relatorios") return problemasComuns.relatorios
    }
    return []
  }

  const problemasDisponiveis = getProblemasDisponiveis()
  const isOutroProblema = formData.problema.includes("Outro")
  
  // Mostra problemas quando todas as seleções necessárias foram feitas
  const mostrarProblemas = () => {
    if (formData.tipo === "infra" && formData.categoria) return true
    if (formData.tipo === "sistemas" && formData.categoria === "relatorios") return true
    if (formData.tipo === "sistemas" && formData.categoria && formData.sistema) return true
    return false
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Chamado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Chamado</DialogTitle>
          <DialogDescription>
            Selecione o tipo do problema e preencha as informações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {/* Tipo do Chamado - Infra ou Sistemas */}
            <div className="grid gap-2">
              <Label>Área *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.tipo === "infra" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col gap-2 ${
                    formData.tipo === "infra" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => handleInputChange("tipo", "infra")}
                >
                  <Server className="w-6 h-6" />
                  <span className="font-medium">Infraestrutura</span>
                  <span className="text-xs opacity-80">Rede, hardware, impressora</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.tipo === "sistemas" ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col gap-2 ${
                    formData.tipo === "sistemas" ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => handleInputChange("tipo", "sistemas")}
                >
                  <Monitor className="w-6 h-6" />
                  <span className="font-medium">Sistemas</span>
                  <span className="text-xs opacity-80">ERP, automação, aplicações</span>
                </Button>
              </div>
            </div>

            {/* Categorias de Infra */}
            {formData.tipo === "infra" && (
              <div className="grid gap-2">
                <Label>Categoria *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categoriasInfra.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        variant={formData.categoria === cat.id ? "default" : "outline"}
                        className={`h-auto py-3 flex flex-col gap-1 ${
                          formData.categoria === cat.id ? "bg-primary text-primary-foreground" : ""
                        }`}
                        onClick={() => handleInputChange("categoria", cat.id)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{cat.nome}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Categoria - Sistemas, Automação ou Relatórios */}
            {formData.tipo === "sistemas" && (
              <div className="grid gap-2">
                <Label>Categoria *</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={formData.categoria === "sistemas" ? "default" : "outline"}
                    className={`h-auto py-3 flex flex-col gap-1 ${
                      formData.categoria === "sistemas" ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => handleInputChange("categoria", "sistemas")}
                  >
                    <Monitor className="w-5 h-5" />
                    <span className="font-medium text-sm">Sistemas</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.categoria === "automacao" ? "default" : "outline"}
                    className={`h-auto py-3 flex flex-col gap-1 ${
                      formData.categoria === "automacao" ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => handleInputChange("categoria", "automacao")}
                  >
                    <Bot className="w-5 h-5" />
                    <span className="font-medium text-sm">Automação</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.categoria === "relatorios" ? "default" : "outline"}
                    className={`h-auto py-3 flex flex-col gap-1 ${
                      formData.categoria === "relatorios" ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => handleInputChange("categoria", "relatorios")}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium text-sm">Relatórios</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Sistemas */}
            {formData.tipo === "sistemas" && formData.categoria === "sistemas" && (
              <div className="grid gap-2">
                <Label>Qual sistema? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {listaSistemas.map((sistema) => (
                    <Button
                      key={sistema.id}
                      type="button"
                      variant={formData.sistema === sistema.id ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col gap-1 ${
                        formData.sistema === sistema.id ? "bg-primary text-primary-foreground" : ""
                      }`}
                      onClick={() => handleInputChange("sistema", sistema.id)}
                    >
                      {sistema.logo ? (
                        <Image
                          src={sistema.logo}
                          alt={sistema.nome}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <Monitor className="w-5 h-5" />
                      )}
                      <span className="text-xs font-medium">{sistema.nome}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Automação */}
            {formData.tipo === "sistemas" && formData.categoria === "automacao" && (
              <div className="grid gap-2">
                <Label>Qual sistema? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {listaAutomacao.map((sistema) => (
                    <Button
                      key={sistema.id}
                      type="button"
                      variant={formData.sistema === sistema.id ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col gap-1 ${
                        formData.sistema === sistema.id ? "bg-primary text-primary-foreground" : ""
                      }`}
                      onClick={() => handleInputChange("sistema", sistema.id)}
                    >
                      <Image
                        src={sistema.logo}
                        alt={sistema.nome}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <span className="text-xs font-medium">{sistema.nome}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Problema Comum */}
            {mostrarProblemas() && (
              <div className="grid gap-2">
                <Label>Qual o problema? *</Label>
                <Select value={formData.problema} onValueChange={(value) => handleInputChange("problema", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o problema..." />
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
            )}

            {/* Campo de assunto personalizado para "Outro" */}
            {isOutroProblema && (
              <div className="grid gap-2">
                <Label htmlFor="subject">Descreva o problema *</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Problema específico que não está na lista..."
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                />
              </div>
            )}
            
            {/* Descrição */}
            {formData.problema && (
              <div className="grid gap-2">
                <Label htmlFor="description">Detalhes do problema *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva com mais detalhes o que está acontecendo, quando começou, o que você já tentou fazer..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>
            )}

            {/* AnyDesk */}
            {formData.problema && (
              <div className="grid gap-2">
                <Label htmlFor="anydesk">Número do AnyDesk (opcional)</Label>
                <Input
                  id="anydesk"
                  placeholder="Ex: 123 456 789"
                  value={formData.anydesk}
                  onChange={(e) => handleInputChange("anydesk", e.target.value)}
                />
              </div>
            )}

            {/* Urgência */}
            {formData.problema && (
              <div className="grid gap-2">
                <Label>Urgência *</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "low", label: "Baixa", color: "bg-green-100 text-green-700 border-green-300" },
                    { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                    { value: "high", label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-300" },
                    { value: "critical", label: "Crítica", color: "bg-red-100 text-red-700 border-red-300" },
                  ].map((urg) => (
                    <Button
                      key={urg.value}
                      type="button"
                      variant="outline"
                      className={`text-xs py-2 ${
                        formData.urgency === urg.value 
                          ? urg.color + " border-2" 
                          : "hover:" + urg.color
                      }`}
                      onClick={() => handleInputChange("urgency", urg.value)}
                    >
                      {urg.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Anexos */}
            {formData.problema && (
              <div className="grid gap-2">
                <Label>Anexos (opcional)</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full justify-start gap-2 text-sm"
                  >
                    <Paperclip className="w-4 h-4" />
                    Adicionar print ou arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  />
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={
                !formData.tipo || 
                !formData.categoria ||
                !formData.problema || 
                !formData.description || 
                !formData.urgency ||
                (formData.tipo === "sistemas" && formData.categoria !== "relatorios" && !formData.sistema) ||
                (isOutroProblema && !formData.subject)
              }
            >
              Criar Chamado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
