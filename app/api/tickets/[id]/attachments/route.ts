import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// POST - Upload de arquivo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Verificar se o ticket está fechado ou resolvido
    if (ticket.status === "Fechado" || ticket.status === "Resolvido") {
      return NextResponse.json({ error: "Não é possível enviar arquivos em chamados fechados ou resolvidos" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar tipo de arquivo (imagens e documentos comuns)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de arquivo não permitido. Permitidos: imagens, PDF, Word, Excel, TXT" 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Arquivo muito grande. Tamanho máximo: 10MB" 
      }, { status: 400 })
    }

    // Criar diretório de uploads se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets', ticketId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadDir, fileName)

    // Salvar arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Salvar no banco de dados
    const attachment = await prisma.attachment.create({
      data: {
        filename: originalName,
        url: `/uploads/tickets/${ticketId}/${fileName}`,
        size: file.size,
        mimeType: file.type,
        ticketId,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("Erro ao fazer upload:", error)
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo" }, { status: 500 })
  }
}

// GET - Listar anexos do ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params
    
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const attachments = await prisma.attachment.findMany({
      where: { ticketId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error("Erro ao buscar anexos:", error)
    return NextResponse.json({ error: "Erro ao buscar anexos" }, { status: 500 })
  }
}