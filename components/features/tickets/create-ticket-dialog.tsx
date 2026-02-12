"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Paperclip, X, Server, Monitor, Bot, FileText, Wifi, DollarSign, Wrench, Printer, Phone, CheckCircle2, User } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
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
  { id: "equipamento", nome: "Equipamento parou de funcionar", icon: Wrench },
  { id: "impressora", nome: "Impressora", icon: Printer },
  { id: "telefonia", nome: "Telefonia/Ramal", icon: Phone },
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
    "Atolamento de papel",
    "Criar um scanner",
    "Falha na impressão",
    "Mancha na impressão",
    "Variação de cores",
    "Outro problema de impressora",
  ],
  telefonia: [
    "Telefone não faz ligação",
    "Telefone não recebe ligação",
    "Ramal sem sinal",
    "Problema com headset",
    "Configuração de ramal",
    "Transferência de ramal",
    "Outro problema de telefonia",
  ],
  sistemas: [
    "Sistema não abre/trava",
    "Erro ao fazer login",
    "Instalação de software",
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
    requesterId?: string
  }) => void
  userRole?: string
  userId?: string
}

export function CreateTicketDialog({ onCreateTicket, userRole, userId }: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCables, setShowCables] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "",
    categoria: "", // "sistemas" ou "automacao"
    sistema: "",
    problema: "",
    subject: "",
    description: "",
    anydesk: "",
    urgency: "",
    requesterId: "", // ID do usuário para quem o chamado está sendo criado
  })

  // Verificar se o usuário é líder
  const isLeader = userRole?.includes("lider") || userRole === "admin"

  // Buscar lista de usuários quando o dialog abrir (apenas para líderes)
  useEffect(() => {
    if (open && isLeader) {
      fetchUsers()
    }
  }, [open, isLeader])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas usuários ativos e que não são da TI
        const filteredUsers = data.users.filter((u: any) => 
          u.status === 'ativo' && 
          u.role === 'user'
        )
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Cores dos cabos de rede
  const cableColors = [
    "#FF6B6B", // Vermelho
    "#4ECDC4", // Azul claro
    "#45B7D1", // Azul
    "#FFA07A", // Laranja
    "#98D8C8", // Verde água
    "#FFD93D", // Amarelo
    "#6BCF7F", // Verde
    "#A8E6CF", // Verde claro
  ]

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
      requesterId: "",
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

    // Trigger cable animation when clicking Infra
    if (field === "tipo" && value === "infra") {
      setShowCables(true)
      setTimeout(() => setShowCables(false), 2000)
    }
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
      if (formData.categoria === "telefonia") return problemasComuns.telefonia
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

  // Variantes de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  }

  const cardVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Chamado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden relative">
        {/* Animação de cabos caindo */}
        <AnimatePresence>
          {showCables && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => {
                const color = cableColors[i % cableColors.length]
                const startXPercent = 15 + Math.random() * 70 // Entre 15% e 85%
                const rotation = -20 + Math.random() * 40
                const delay = Math.random() * 0.4
                
                return (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${startXPercent}%`,
                    }}
                    initial={{ 
                      y: '-150px',
                      rotate: rotation,
                      opacity: 1,
                      scale: 0.7 + Math.random() * 0.5
                    }}
                    animate={{ 
                      y: 'calc(100% + 100px)', // Cai até o final do modal + 100px
                      rotate: rotation + (Math.random() > 0.5 ? 180 : -180),
                      opacity: [1, 1, 1, 0.5, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 0.5,
                      delay: delay,
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    {/* Cabo com RJ45 */}
                    <div className="flex flex-col items-center">
                      {/* Conector RJ45 superior */}
                      <svg width="24" height="18" viewBox="0 0 24 18" className="drop-shadow-lg">
                        <defs>
                          <linearGradient id={`grad-top-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.8 }} />
                          </linearGradient>
                        </defs>
                        <rect x="3" y="0" width="18" height="14" fill={`url(#grad-top-${i})`} stroke="#1a1a1a" strokeWidth="0.8" rx="1.5"/>
                        <rect x="5" y="12" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="8.5" y="12" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="12" y="12" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="15.5" y="12" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="6" y="2" width="12" height="8" fill="#1a1a1a" opacity="0.4" rx="1"/>
                        <circle cx="12" cy="6" r="1.5" fill="#333" opacity="0.6"/>
                      </svg>
                      
                      {/* Cabo */}
                      <div 
                        className="rounded-full"
                        style={{ 
                          width: '3px',
                          height: '70px',
                          background: `linear-gradient(180deg, ${color} 0%, ${color}ee 50%, ${color}cc 100%)`,
                          boxShadow: `0 0 8px ${color}66, inset 0 0 3px rgba(255,255,255,0.3)`
                        }}
                      />
                      
                      {/* Conector RJ45 inferior */}
                      <svg width="24" height="18" viewBox="0 0 24 18" className="drop-shadow-lg">
                        <defs>
                          <linearGradient id={`grad-bottom-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <rect x="3" y="4" width="18" height="14" fill={`url(#grad-bottom-${i})`} stroke="#1a1a1a" strokeWidth="0.8" rx="1.5"/>
                        <rect x="5" y="0" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="8.5" y="0" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="12" y="0" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="15.5" y="0" width="2.5" height="6" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.4"/>
                        <rect x="6" y="8" width="12" height="8" fill="#1a1a1a" opacity="0.4" rx="1"/>
                        <circle cx="12" cy="12" r="1.5" fill="#333" opacity="0.6"/>
                      </svg>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <DialogTitle>Criar Novo Chamado</DialogTitle>
          <DialogDescription>
            {isLeader 
              ? "Selecione para quem você está criando o chamado e preencha as informações."
              : "Selecione o tipo do problema e preencha as informações."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {/* Seletor de Usuário - Apenas para Líderes */}
            {isLeader && (
              <motion.div
                key="requester"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Criar chamado para *
                </Label>
                <Select 
                  value={formData.requesterId} 
                  onValueChange={(value) => handleInputChange("requesterId", value)}
                >
                  <SelectTrigger className="transition-all duration-300 hover:border-primary/50">
                    <SelectValue placeholder={loadingUsers ? "Carregando usuários..." : "Selecione o usuário..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Para mim mesmo</span>
                      </div>
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.requesterId && formData.requesterId !== "self" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Chamado será criado em nome de {users.find(u => u.id === formData.requesterId)?.name}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Tipo do Chamado - Infra ou Sistemas */}
            <AnimatePresence mode="wait">
              <motion.div
                key="tipo"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Área *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    variants={cardVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      variant={formData.tipo === "infra" ? "default" : "outline"}
                      className={`h-auto py-6 flex flex-col gap-2 w-full transition-all duration-300 ${
                        formData.tipo === "infra" 
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleInputChange("tipo", "infra")}
                    >
                      <Server className="w-7 h-7" />
                      <span className="font-semibold">Infraestrutura</span>
                      <span className="text-xs opacity-80">Rede, hardware, impressora</span>
                      {formData.tipo === "infra" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <CheckCircle2 className="w-5 h-5 absolute top-2 right-2" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      variant={formData.tipo === "sistemas" ? "default" : "outline"}
                      className={`h-auto py-6 flex flex-col gap-2 w-full transition-all duration-300 ${
                        formData.tipo === "sistemas" 
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleInputChange("tipo", "sistemas")}
                    >
                      <Monitor className="w-7 h-7" />
                      <span className="font-semibold">Sistemas</span>
                      <span className="text-xs opacity-80">ERP, automação, aplicações</span>
                      {formData.tipo === "sistemas" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <CheckCircle2 className="w-5 h-5 absolute top-2 right-2" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Categorias de Infra */}
            {formData.tipo === "infra" && (
              <motion.div
                key="categorias-infra"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Categoria *</Label>
                <motion.div 
                  className="grid grid-cols-2 gap-2"
                  variants={containerVariants}
                >
                  {categoriasInfra.map((cat, index) => {
                    const Icon = cat.icon
                    return (
                      <motion.div
                        key={cat.id}
                        variants={cardVariants}
                        initial="idle"
                        whileHover="hover"
                        whileTap="tap"
                        custom={index}
                      >
                        <Button
                          type="button"
                          variant={formData.categoria === cat.id ? "default" : "outline"}
                          className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                            formData.categoria === cat.id 
                              ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                              : "hover:border-primary/50 hover:bg-primary/5"
                          }`}
                          onClick={() => handleInputChange("categoria", cat.id)}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium text-center">{cat.nome}</span>
                          {formData.categoria === cat.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              className="absolute top-1 right-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* Categoria - Sistemas, Automação ou Relatórios */}
            {formData.tipo === "sistemas" && (
              <motion.div
                key="categorias-sistemas"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Categoria *</Label>
                <motion.div 
                  className="grid grid-cols-3 gap-3"
                  variants={containerVariants}
                >
                  <motion.div
                    variants={cardVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      variant={formData.categoria === "sistemas" ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                        formData.categoria === "sistemas" 
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleInputChange("categoria", "sistemas")}
                    >
                      <Monitor className="w-6 h-6" />
                      <span className="font-medium text-sm">Sistemas</span>
                      {formData.categoria === "sistemas" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute top-1 right-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      variant={formData.categoria === "automacao" ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                        formData.categoria === "automacao" 
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleInputChange("categoria", "automacao")}
                    >
                      <Bot className="w-6 h-6" />
                      <span className="font-medium text-sm">Automação</span>
                      {formData.categoria === "automacao" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute top-1 right-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={cardVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="button"
                      variant={formData.categoria === "relatorios" ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                        formData.categoria === "relatorios" 
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                          : "hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleInputChange("categoria", "relatorios")}
                    >
                      <FileText className="w-6 h-6" />
                      <span className="font-medium text-sm">Relatórios</span>
                      {formData.categoria === "relatorios" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute top-1 right-1"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Lista de Sistemas */}
            {formData.tipo === "sistemas" && formData.categoria === "sistemas" && (
              <motion.div
                key="lista-sistemas"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Qual sistema? *</Label>
                <motion.div 
                  className="grid grid-cols-3 gap-2"
                  variants={containerVariants}
                >
                  {listaSistemas.map((sistema, index) => (
                    <motion.div
                      key={sistema.id}
                      variants={cardVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      custom={index}
                    >
                      <Button
                        type="button"
                        variant={formData.sistema === sistema.id ? "default" : "outline"}
                        className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                          formData.sistema === sistema.id 
                            ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                            : "hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() => handleInputChange("sistema", sistema.id)}
                      >
                        {sistema.logo ? (
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Image
                              src={sistema.logo}
                              alt={sistema.nome}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </motion.div>
                        ) : (
                          <Monitor className="w-6 h-6" />
                        )}
                        <span className="text-xs font-medium text-center">{sistema.nome}</span>
                        {formData.sistema === sistema.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="absolute top-1 right-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Lista de Automação */}
            {formData.tipo === "sistemas" && formData.categoria === "automacao" && (
              <motion.div
                key="lista-automacao"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Qual sistema? *</Label>
                <motion.div 
                  className="grid grid-cols-3 gap-2"
                  variants={containerVariants}
                >
                  {listaAutomacao.map((sistema, index) => (
                    <motion.div
                      key={sistema.id}
                      variants={cardVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      custom={index}
                    >
                      <Button
                        type="button"
                        variant={formData.sistema === sistema.id ? "default" : "outline"}
                        className={`h-auto py-4 flex flex-col gap-2 w-full transition-all duration-300 relative ${
                          formData.sistema === sistema.id 
                            ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2" 
                            : "hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() => handleInputChange("sistema", sistema.id)}
                      >
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Image
                            src={sistema.logo}
                            alt={sistema.nome}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </motion.div>
                        <span className="text-xs font-medium text-center">{sistema.nome}</span>
                        {formData.sistema === sistema.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="absolute top-1 right-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Problema Comum */}
            {mostrarProblemas() && (
              <motion.div
                key="problema"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Qual o problema? *</Label>
                <Select value={formData.problema} onValueChange={(value) => handleInputChange("problema", value)}>
                  <SelectTrigger className="transition-all duration-300 hover:border-primary/50">
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
              </motion.div>
            )}

            {/* Campo de assunto personalizado para "Outro" */}
            {isOutroProblema && (
              <motion.div
                key="subject"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label htmlFor="subject" className="text-base font-semibold">Descreva o problema *</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Problema específico que não está na lista..."
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  required
                />
              </motion.div>
            )}
            
            {/* Descrição */}
            {formData.problema && (
              <motion.div
                key="description"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label htmlFor="description" className="text-base font-semibold">Detalhes do problema *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva com mais detalhes o que está acontecendo, quando começou, o que você já tentou fazer..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-primary"
                  required
                />
              </motion.div>
            )}

            {/* AnyDesk */}
            {formData.problema && formData.tipo === "infra" && formData.categoria !== "orcamentos" && (
              <motion.div
                key="anydesk"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label htmlFor="anydesk" className="text-base font-semibold">Número do AnyDesk (opcional)</Label>
                <Input
                  id="anydesk"
                  placeholder="Ex: 123 456 789"
                  value={formData.anydesk}
                  onChange={(e) => handleInputChange("anydesk", e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
              </motion.div>
            )}

            {/* Urgência */}
            {formData.problema && (
              <motion.div
                key="urgency"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Urgência *</Label>
                <motion.div 
                  className="grid grid-cols-4 gap-2"
                  variants={containerVariants}
                >
                  {[
                    { value: "low", label: "Baixa", color: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" },
                    { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200" },
                    { value: "high", label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200" },
                    { value: "critical", label: "Crítica", color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
                  ].map((urg) => (
                    <motion.div
                      key={urg.value}
                      variants={cardVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className={`text-xs py-3 w-full transition-all duration-300 ${
                          formData.urgency === urg.value 
                            ? urg.color + " border-2 shadow-md" 
                            : urg.color.replace('hover:', '')
                        }`}
                        onClick={() => handleInputChange("urgency", urg.value)}
                      >
                        {urg.label}
                        {formData.urgency === urg.value && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className="ml-1"
                          >
                            ✓
                          </motion.span>
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Anexos */}
            {formData.problema && (
              <motion.div
                key="attachments"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-2"
              >
                <Label className="text-base font-semibold">Anexos (opcional)</Label>
                <div className="space-y-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full justify-start gap-2 text-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Paperclip className="w-4 h-4" />
                      Adicionar print ou arquivo
                    </Button>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  />
                  
                  <AnimatePresence>
                    {attachments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 max-h-32 overflow-y-auto"
                      >
                        {attachments.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs truncate" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
          
          <DialogFooter>
            <motion.div
              className="flex gap-2 w-full sm:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 transition-all duration-300"
                  disabled={
                    !formData.tipo || 
                    !formData.categoria ||
                    !formData.problema || 
                    !formData.description || 
                    !formData.urgency ||
                    (isLeader && !formData.requesterId) ||
                    (formData.tipo === "sistemas" && formData.categoria !== "relatorios" && !formData.sistema) ||
                    (isOutroProblema && !formData.subject)
                  }
                >
                  Criar Chamado
                </Button>
              </motion.div>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
