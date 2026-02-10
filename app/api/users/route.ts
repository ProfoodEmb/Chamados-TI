import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

// GET - Listar usuários (só para lider_infra)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API Users] Iniciando listagem de usuários...')
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    console.log('👤 [API Users] Sessão:', session?.user ? { id: session.user.id, role: session.user.role } : 'Não autenticado')

    if (!session?.user) {
      console.log('❌ [API Users] Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é usuário de TI (para listagem básica no Kanban)
    const isITUser = session.user.role === "admin" || 
                     session.user.role === "lider_infra" || 
                     session.user.role === "func_infra" || 
                     session.user.role === "lider_sistemas" || 
                     session.user.role === "func_sistemas"

    if (!isITUser) {
      console.log('❌ [API Users] Acesso negado. Role:', session.user.role)
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const team = searchParams.get('team')

    console.log('🔍 [API Users] Parâmetros:', { status, search, team })

    // Construir filtros
    const where: any = {}
    
    if (status && status !== 'todos') {
      where.status = status
    }
    
    if (team) {
      where.team = team
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { setor: { contains: search, mode: 'insensitive' } },
      ]
    }

    console.log('🔍 [API Users] Filtros construídos:', where)

    console.log('🔍 [API Users] Executando query no Prisma...')
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        team: true,
        setor: true,
        empresa: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ [API Users] Query executada com sucesso. Usuários encontrados:', users.length)

    return NextResponse.json({ users })

  } catch (error) {
    console.error("❌ [API Users] Erro ao listar usuários:", error)
    console.error("❌ [API Users] Stack trace:", (error as Error).stack)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Criar novo usuário (só para lider_infra)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando criação de usuário...')
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    console.log('👤 Sessão atual:', session?.user ? { id: session.user.id, role: session.user.role } : 'Não autenticado')

    if (!session?.user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se é líder de infraestrutura
    if (session.user.role !== "lider_infra") {
      console.log('❌ Acesso negado. Role atual:', session.user.role)
      return NextResponse.json({ error: "Acesso negado. Apenas líderes de infraestrutura podem criar usuários." }, { status: 403 })
    }

    const body = await request.json()
    console.log('📦 Body recebido:', body)
    
    const { name, email, username, password, role, setor, empresa } = body

    console.log('📝 Dados extraídos:', { name, email, username, role, setor, empresa })

    // Auto-gerar team baseado no role
    let team = "user"
    if (role.includes("infra")) {
      team = "infra"
    } else if (role.includes("sistemas")) {
      team = "sistemas"
    }

    console.log('🏢 Team auto-gerado:', team)

    // Validação básica
    if (!name || !email || !username || !password || !role || !setor || !empresa) {
      console.log('❌ Campos obrigatórios faltando:', { 
        name: !!name, 
        email: !!email, 
        username: !!username, 
        password: !!password, 
        role: !!role, 
        setor: !!setor, 
        empresa: !!empresa 
      })
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Validar roles permitidos
    const allowedRoles = ["user", "func_infra", "lider_sistemas", "func_sistemas"]
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Role não permitido" }, { status: 400 })
    }

    // Validar empresas permitidas
    const allowedEmpresas = ["profood", "tuicial"]
    if (!allowedEmpresas.includes(empresa)) {
      return NextResponse.json({ error: "Empresa não permitida" }, { status: 400 })
    }

    // Validar setores permitidos (agora aceita qualquer string não vazia)
    if (!setor || setor.trim() === "") {
      return NextResponse.json({ error: "Setor é obrigatório" }, { status: 400 })
    }

    // Criar usuário usando Better Auth corretamente
    try {
      console.log('🔐 Tentando criar usuário com Better Auth...')
      console.log('📋 Dados para Better Auth:', {
        email,
        password: '***',
        name,
        username,
        role,
        team,
        setor,
        empresa,
      })

      const newUser = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          username,
          role,
          team,
          setor,
          empresa,
          status: "ativo", // Status padrão
        }
      })

      console.log('✅ Usuário criado com sucesso:', newUser)

      return NextResponse.json({ 
        message: "Usuário criado com sucesso",
        user: {
          id: newUser.user?.id,
          name: newUser.user?.name,
          email: newUser.user?.email,
          username: newUser.user?.username,
          role: newUser.user?.role,
          team: newUser.user?.team,
          setor: newUser.user?.setor,
          empresa: newUser.user?.empresa,
          status: newUser.user?.status,
        }
      }, { status: 201 })

    } catch (authError: any) {
      console.error('❌ Erro do Better Auth:', authError)
      console.error('❌ Stack trace:', authError.stack)
      console.error('❌ Mensagem completa:', authError.message)
      
      // Tratar erros específicos do Better Auth
      if (authError.message?.includes('already exists') || authError.message?.includes('duplicate')) {
        return NextResponse.json({ error: "Email ou username já existe" }, { status: 409 })
      }
      
      return NextResponse.json({ error: "Erro ao criar usuário: " + authError.message }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Erro geral ao criar usuário:", error)
    console.error("❌ Stack trace geral:", (error as Error).stack)
    return NextResponse.json({ error: "Erro interno do servidor: " + (error as Error).message }, { status: 500 })
  }
}