"use client"

import { useState } from "react"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated?: () => void
}

export function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    team: "",
    setor: "",
    setorCustom: "", // Campo para setor personalizado
    empresa: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role,
      // Auto-definir team baseado no role
      team: role === "user" ? "user" : 
            role.includes("infra") ? "infra" : 
            role.includes("sistemas") ? "sistemas" : ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.username || !formData.password || !formData.role || !formData.empresa) {
      alert("Todos os campos são obrigatórios")
      return
    }

    // Validar setor (deve ter setor selecionado ou setor customizado preenchido)
    const setorFinal = formData.setor === "custom" ? formData.setorCustom : formData.setor
    if (!setorFinal) {
      alert("Por favor, selecione um setor ou especifique um setor personalizado")
      return
    }

    setIsLoading(true)

    try {
      // Auto-gerar email baseado no username
      const email = `${formData.username}@empresa.com`
      
      const requestBody = {
        ...formData,
        email, // Email auto-gerado
        setor: formData.setor === "custom" ? formData.setorCustom : formData.setor
      }

      console.log('📤 Enviando dados para criar usuário:', requestBody)

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 Status da resposta:', response.status)
      console.log('📡 Headers da resposta:', response.headers)

      let result
      try {
        result = await response.json()
        console.log('📦 Resultado da API:', result)
      } catch (jsonError) {
        console.error('❌ Erro ao fazer parse do JSON:', jsonError)
        const textResult = await response.text()
        console.error('📄 Resposta como texto:', textResult)
        alert("Erro: Resposta inválida do servidor")
        return
      }

      if (response.ok) {
        console.log('✅ Usuário criado com sucesso:', result)
        
        // Mostrar toast de sucesso
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`✨ Usuário ${formData.name} criado com sucesso!`, 'success')
        }
        
        // Limpar formulário
        setFormData({
          name: "",
          username: "",
          password: "",
          role: "",
          team: "",
          setor: "",
          setorCustom: "",
          empresa: "",
        })
        
        onOpenChange(false)
        onUserCreated?.()
      } else {
        console.error('❌ Erro ao criar usuário:', result)
        alert(`Erro ao criar usuário: ${result.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error)
      console.error("❌ Tipo do erro:", typeof error)
      console.error("❌ Stack trace:", (error as Error).stack)
      alert("Erro ao criar usuário. Verifique sua conexão e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "",
        team: "",
        setor: "",
        setorCustom: "",
        empresa: "",
      })
      setShowPassword(false)
    }
    onOpenChange(open)
  }

  const roleOptions = [
    { value: "user", label: "Usuário Comum", team: "user" },
    { value: "func_infra", label: "Funcionário de Infraestrutura", team: "infra" },
    { value: "lider_sistemas", label: "Líder de Sistemas", team: "sistemas" },
    { value: "func_sistemas", label: "Funcionário de Sistemas", team: "sistemas" },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-hidden border-0 p-0 gap-0 z-50">
        <DialogTitle className="sr-only">
          Criar Novo Usuário
        </DialogTitle>
        
        {/* Header com gradiente verde */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Criar Novo Usuário</h2>
              <p className="text-white/90 text-sm">Adicionar novo usuário ao sistema</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-6 space-y-4">
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Digite o nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-colors"
                required
              />
            </div>



            {/* Username */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Nome de Usuário <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="usuario_login"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="h-11 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500">Usado para fazer login no sistema</p>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Senha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite uma senha segura"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-11 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-colors pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            {/* Tipo de Usuário */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Tipo de Usuário <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-11 border-2 border-gray-200 hover:border-green-400 transition-colors">
                  <SelectValue placeholder="Selecione o tipo de usuário..." />
                </SelectTrigger>
                <SelectContent className="z-[9999]" position="popper" sideOffset={4}>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Setor */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Setor <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border-2 border-gray-200 rounded-lg">
                {[
                  { value: "dpi", label: "DPI" },
                  { value: "pd", label: "P&D" },
                  { value: "seguranca", label: "Segurança do Trabalho" },
                  { value: "pcp", label: "PCP" },
                  { value: "ctp", label: "CTP" },
                  { value: "almoxarifado", label: "Almoxarifado" },
                  { value: "faturamento", label: "Faturamento" },
                  { value: "logistica", label: "Logística" },
                  { value: "vendas", label: "Vendas" },
                  { value: "financeiro", label: "Financeiro" },
                  { value: "rh", label: "Recursos Humanos" },
                  { value: "marketing", label: "Marketing" },
                  { value: "operacional", label: "Operacional" },
                  { value: "producao", label: "Produção" },
                  { value: "qualidade", label: "Qualidade" },
                  { value: "compras", label: "Compras" },
                  { value: "diretoria", label: "Diretoria" },
                  { value: "ti", label: "T.I." },
                  { value: "custom", label: "Outro (especificar)" },
                ].map((setor) => (
                  <button
                    key={setor.value}
                    type="button"
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      formData.setor === setor.value 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                    }`}
                    onClick={() => {
                      handleInputChange("setor", setor.value)
                      // Limpar setor customizado se não for "custom"
                      if (setor.value !== "custom") {
                        handleInputChange("setorCustom", "")
                      }
                    }}
                  >
                    {formData.setor === setor.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="text-sm font-medium">{setor.label}</div>
                  </button>
                ))}
              </div>
              
              {/* Campo para setor personalizado */}
              {formData.setor === "custom" && (
                <div className="mt-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Especifique o setor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Digite o nome do setor..."
                    value={formData.setorCustom}
                    onChange={(e) => handleInputChange("setorCustom", e.target.value)}
                    className="mt-2 h-11 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-colors"
                    required
                  />
                </div>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Empresa <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    value: "profood", 
                    label: "Profood",
                    selectedColor: "border-red-500 bg-red-50 text-red-700",
                    hoverColor: "hover:border-red-300 hover:bg-red-50",
                    checkColor: "bg-red-500"
                  },
                  { 
                    value: "tuicial", 
                    label: "Tuicial",
                    selectedColor: "border-blue-500 bg-blue-50 text-blue-700",
                    hoverColor: "hover:border-blue-300 hover:bg-blue-50",
                    checkColor: "bg-blue-500"
                  },
                ].map((empresa) => (
                  <button
                    key={empresa.value}
                    type="button"
                    className={`relative p-4 rounded-lg border-2 transition-all text-center ${
                      formData.empresa === empresa.value 
                        ? empresa.selectedColor
                        : `border-gray-200 bg-white ${empresa.hoverColor}`
                    }`}
                    onClick={() => handleInputChange("empresa", empresa.value)}
                  >
                    {formData.empresa === empresa.value && (
                      <div className={`absolute -top-2 -right-2 w-6 h-6 ${empresa.checkColor} rounded-full flex items-center justify-center shadow-lg`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="text-sm font-semibold">{empresa.label}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <DialogFooter className="p-6 bg-gray-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
              className="h-11 px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={
                !formData.name || 
                !formData.username ||
                !formData.password ||
                !formData.role ||
                (!formData.setor || (formData.setor === "custom" && !formData.setorCustom)) ||
                !formData.empresa ||
                isLoading
              }
              className="h-11 px-6 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}