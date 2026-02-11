"use client"

import { Wifi, WifiOff, Activity, Clock } from 'lucide-react'

interface RealtimeIndicatorProps {
  isConnected: boolean
  lastUpdate?: string
  error?: string | null
  onForceUpdate?: () => void
}

export function RealtimeIndicator({ 
  isConnected, 
  lastUpdate, 
  error, 
  onForceUpdate 
}: RealtimeIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Status de conexão */}
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
        ${isConnected 
          ? 'bg-green-50 border-green-200 shadow-sm' 
          : 'bg-red-50 border-red-200'
        }
      `}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Tempo Real
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {error ? 'Erro de Conexão' : 'Desconectado'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Última atualização */}
      {lastUpdate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
          <Clock className="w-3 h-3" />
          <span>{lastUpdate}</span>
        </div>
      )}

      {/* Botão de atualização manual */}
      {onForceUpdate && (
        <button
          onClick={onForceUpdate}
          className="
            flex items-center gap-1 px-3 py-2 rounded-lg
            bg-blue-50 border border-blue-200 text-blue-700
            hover:bg-blue-100 hover:border-blue-300
            transition-all duration-200 text-sm font-medium
          "
        >
          <Activity className="w-3 h-3" />
          <span>Atualizar</span>
        </button>
      )}

      {/* Indicador de erro */}
      {error && (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  )
}