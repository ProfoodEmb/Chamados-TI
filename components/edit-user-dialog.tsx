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
import { User, Lock, Briefcase, Building } from "lucide-react"

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
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "",
    setor: "",
    setorCustom: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Preencher formulário quando o usuário mudar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        password: "",
        role: user.role,
        setor: user.setor || "",
        setorCustom: "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    setIsSubmitting(true)

    try {
      const updateData: any = {
        name: formData.name,
        role: formData.role,
        setor: formData.setor === "outro" ? formData.setorCustom : formData.setor,
      }

      // Só incluir senha se foi preenchida
      if (formData.password) {
        updateData.password = formData.password
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
      password: "",
      role: "",
      setor: "",
      setorCustom: "",
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

          {/* Senha (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-password">
              <Lock className="w-4 h-4 inline mr-2" />
              Nova Senha (deixe em branco para manter a atual)
            </Label>
            <Input
              id="edit-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Digite a nova senha"
            />
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
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="RH">Recursos Humanos</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operações">Operações</SelectItem>
                <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setor Customizado */}
          {formData.setor === "outro" && (
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
