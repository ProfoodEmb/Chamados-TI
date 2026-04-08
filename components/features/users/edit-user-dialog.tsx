"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Lock, Briefcase, Building, Eye, EyeOff } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  team: string
  setor: string | null
  empresa: string | null
  status: string
}

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onUserUpdated: () => void
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const setorOptions = [
    { value: "dpi", label: "DPI" },
    { value: "pd", label: "P&D" },
    { value: "seguranca", label: "Seguranca do Trabalho" },
    { value: "pcp", label: "PCP" },
    { value: "ctp", label: "CTP" },
    { value: "almoxarifado", label: "Almoxarifado" },
    { value: "faturamento", label: "Faturamento" },
    { value: "logistica", label: "Logistica" },
    { value: "vendas", label: "Vendas" },
    { value: "financeiro", label: "Financeiro" },
    { value: "rh", label: "Recursos Humanos" },
    { value: "marketing", label: "Marketing" },
    { value: "operacional", label: "Operacional" },
    { value: "producao", label: "Producao" },
    { value: "qualidade", label: "Qualidade" },
    { value: "compras", label: "Compras" },
    { value: "diretoria", label: "Diretoria" },
    { value: "ti", label: "T.I." },
  ]

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    setor: "",
    setorCustom: "",
    empresa: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Preencher formulário quando o usuário mudar
  useEffect(() => {
    if (user) {
      const rawSetor = user.setor?.trim() || ""
      const matchedSetor = setorOptions.find((option) => option.value === rawSetor.toLowerCase())

      setFormData({
        name: user.name,
        username: user.username,
        password: "",
        role: user.role,
        setor: matchedSetor ? matchedSetor.value : rawSetor ? "custom" : "",
        setorCustom: matchedSetor ? "" : rawSetor,
        empresa: user.empresa || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    // Validar senha se foi preenchida
    if (formData.password && formData.password.length < 6) {
      if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
        (window as any).showSimpleToast("A senha deve ter no mínimo 6 caracteres", 'info')
      }
      return
    }

    setIsSubmitting(true)

    try {
      const updateData: any = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        role: formData.role,
        setor: formData.setor === "custom" ? formData.setorCustom.trim() : formData.setor,
        empresa: formData.empresa,
      }

      // Só incluir senha se foi preenchida
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim()
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (response.ok) {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`✏️ Usuário ${formData.name} atualizado com sucesso!`, 'success')
        }
        
        onUserUpdated()
        onOpenChange(false)
        
        // Limpar senha
        setFormData(prev => ({ ...prev, password: "" }))
      } else {
        if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
          (window as any).showSimpleToast(`Erro: ${result.error}`, 'info')
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      if (typeof window !== 'undefined' && (window as any).showSimpleToast) {
        (window as any).showSimpleToast("Erro ao atualizar usuário", 'info')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "",
        setor: "",
        setorCustom: "",
        empresa: "",
      })
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário {user.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="edit-username">
              <User className="w-4 h-4 inline mr-2" />
              Nome de Usuário
            </Label>
            <Input
              id="edit-username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Ex: joao.silva"
              required
            />
            <p className="text-xs text-muted-foreground">
              O email de login padrao e sincronizado automaticamente com este usuario.
            </p>
          </div>

          {/* Senha (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-password">
              <Lock className="w-4 h-4 inline mr-2" />
              Nova Senha (deixe em branco para manter a atual)
            </Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Digite a nova senha"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Deixe em branco se não quiser alterar.
            </p>
          </div>

          {/* Cargo/Role */}
          <div className="space-y-2">
            <Label htmlFor="edit-role">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Cargo
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger id="edit-role">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário Comum</SelectItem>
                <SelectItem value="func_infra">Funcionário Infraestrutura</SelectItem>
                <SelectItem value="lider_infra">Líder Infraestrutura</SelectItem>
                <SelectItem value="func_sistemas">Funcionário Sistemas</SelectItem>
                <SelectItem value="lider_sistemas">Líder Sistemas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <Label htmlFor="edit-setor">
              <Building className="w-4 h-4 inline mr-2" />
              Setor
            </Label>
            <Select value={formData.setor} onValueChange={(value) => setFormData({ ...formData, setor: value })}>
              <SelectTrigger id="edit-setor">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {setorOptions.map((setor) => (
                  <SelectItem key={setor.value} value={setor.value}>
                    {setor.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setor Customizado */}
          {formData.setor === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="edit-setor-custom">Especifique o Setor</Label>
              <Input
                id="edit-setor-custom"
                value={formData.setorCustom}
                onChange={(e) => setFormData({ ...formData, setorCustom: e.target.value })}
                placeholder="Digite o nome do setor"
                required
              />
            </div>
          )}

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="edit-empresa">
              <Building className="w-4 h-4 inline mr-2" />
              Empresa
            </Label>
            <Select value={formData.empresa} onValueChange={(value) => setFormData({ ...formData, empresa: value })}>
              <SelectTrigger id="edit-empresa">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profood">Profood</SelectItem>
                <SelectItem value="tuicial">Tuicial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
