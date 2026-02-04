import { useEffect, useRef, useState } from 'react'

interface SimpleRealtimeOptions {
  onUpdate?: (data: any) => void
  enabled?: boolean
  interval?: number // em milissegundos
}

export function useSimpleRealtime(options: SimpleRealtimeOptions = {}) {
  const { onUpdate, enabled = true, interval = 30000 } = options // 30 segundos por padrão
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('🔄 Iniciando sistema de atualização simples...')
    setIsActive(true)
    
    // Função para verificar atualizações
    const checkForUpdates = () => {
      console.log('🔍 Verificando atualizações...')
      setLastUpdate(new Date())
      onUpdate?.({ type: 'periodic_update', timestamp: new Date() })
    }

    // Configurar intervalo
    intervalRef.current = setInterval(checkForUpdates, interval)

    // Escutar eventos de foco da janela para atualizar imediatamente
    const handleFocus = () => {
      console.log('👁️ Janela focada - verificando atualizações')
      checkForUpdates()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível - verificando atualizações')
        checkForUpdates()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cleanup()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, interval, onUpdate])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
  }

  const forceUpdate = () => {
    console.log('🔄 Atualização forçada')
    setLastUpdate(new Date())
    onUpdate?.({ type: 'force_update', timestamp: new Date() })
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
    
    if (diff < 60) {
      return `${diff}s atrás`
    } else {
      const minutes = Math.floor(diff / 60)
      return `${minutes}min atrás`
    }
  }

  return {
    isActive,
    lastUpdate: formatLastUpdate(),
    forceUpdate,
    interval: interval / 1000 // retorna em segundos para display
  }
}