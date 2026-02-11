import { NextResponse } from "next/server"

// Rota temporária para verificar se as variáveis de ambiente estão carregadas
export async function GET() {
  const config = {
    evolutionApiUrl: !!process.env.EVOLUTION_API_URL,
    evolutionInstanceName: !!process.env.EVOLUTION_INSTANCE_NAME,
    evolutionApiKey: !!process.env.EVOLUTION_API_KEY,
    infraTeamPhone: !!process.env.INFRA_TEAM_PHONE,
    sistemasTeamPhone: !!process.env.SISTEMAS_TEAM_PHONE,
    
    // Valores parciais (por segurança)
    values: {
      evolutionApiUrl: process.env.EVOLUTION_API_URL || 'NÃO CONFIGURADA',
      evolutionInstanceName: process.env.EVOLUTION_INSTANCE_NAME || 'NÃO CONFIGURADA',
      evolutionApiKey: process.env.EVOLUTION_API_KEY ? 
        process.env.EVOLUTION_API_KEY.substring(0, 8) + '...' : 'NÃO CONFIGURADA',
      infraTeamPhone: process.env.INFRA_TEAM_PHONE || 'NÃO CONFIGURADA',
      sistemasTeamPhone: process.env.SISTEMAS_TEAM_PHONE || 'NÃO CONFIGURADA',
    }
  }
  
  return NextResponse.json({
    message: 'Verificação de variáveis de ambiente WhatsApp',
    allConfigured: config.evolutionApiUrl && config.evolutionInstanceName && 
                   config.evolutionApiKey && config.infraTeamPhone,
    config
  })
}
