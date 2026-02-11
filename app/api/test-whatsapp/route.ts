import { NextRequest, NextResponse } from "next/server"
import { testWhatsApp } from "@/lib/api/whatsapp-notifications"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      )
    }

    console.log(`🧪 Testando envio de WhatsApp para: ${phone}`)

    const success = await testWhatsApp(phone)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Mensagem de teste enviada com sucesso!",
        phone
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Falha ao enviar mensagem de teste",
          phone
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Erro ao testar WhatsApp:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar requisição",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

// Permitir GET também para facilitar testes
export async function GET() {
  return NextResponse.json({
    message: "Use POST para testar o envio de WhatsApp",
    example: {
      method: "POST",
      body: { phone: "5545999363214" }
    }
  })
}
