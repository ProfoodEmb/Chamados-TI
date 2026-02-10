import { useEffect, useRef, useState, useCallback } from 'react'

interface NoticesPollingOptions {
  onUpdate?: (data: any) => void
  onNewNotice?: (notice: any) => void
  enabled?: boolean
  interval?: number // em milissegundos
}

export function useNoticesPolling(options: NoticesPollingOptions = {}) {
  const { onUpdate, onNewNotice, enabled = true, interval = 20000 } = options // 20 segundos para avisos
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastNoticesHashRef = useRef<string>('')
  const lastNoticesCountRef = useRef<number>(0)
  const isCheckingRef = useRef<boolean>(false)

  // Memoizar as funções de callback
  const memoizedOnUpdate = useCallback(onUpdate || (() => {}), [onUpdate])
  const memoizedOnNewNotice = useCallback(onNewNotice || (() => {}), [onNewNotice])

  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    console.log('📢 Iniciando sistema de polling para avisos...')
    setIsActive(true)
    
    // Função para verificar atualizações de avisos
    const checkForNoticesUpdates = async () => {
      if (isCheckingRef.current) {
        console.log('⏳ Polling de avisos já em andamento, pulando...')
        return
      }

      isCheckingRef.current = true

      try {
        console.log('🔍 Verificando atualizações de avisos via polling...')
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch('/api/notices', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const notices = await response.json()
          
          console.log(`🔍 Polling avisos: ${notices.length} avisos encontrados`)
          console.log('📋 IDs dos avisos:', notices.map((n: any) => n.id).join(', '))
          
          // SEMPRE notificar mudanças para debug (temporário)
          console.log('🔄 FORÇANDO atualização para debug')
          
          memoizedOnUpdate({ 
            type: 'notices_update', 
            timestamp: new Date(),
            noticeCount: notices.length,
            hasChanges: true,
            notices
          })
          
          // Verificar se há novos avisos comparando com contagem anterior
          if (lastNoticesCountRef.current > 0 && notices.length > lastNoticesCountRef.current) {
            const newestNotice = notices.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0]
            
            console.log('🆕 Novo aviso detectado (por contagem):', newestNotice.title)
            memoizedOnNewNotice(newestNotice)
          }
          
          lastNoticesCountRef.current = notices.length
        }
        
        setLastUpdate(new Date())
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('❌ Erro no polling de avisos:', error)
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    // Primeira verificação
    setTimeout(checkForNoticesUpdates, 1000)

    // Configurar intervalo
    intervalRef.current = setInterval(checkForNoticesUpdates, interval)

    // Escutar eventos de foco para atualizar
    const handleFocus = () => {
      console.log('👁️ Janela focada - verificando avisos')
      setTimeout(checkForNoticesUpdates, 500)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível - verificando avisos')
        setTimeout(checkForNoticesUpdates, 500)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cleanup()
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, interval, memoizedOnUpdate, memoizedOnNewNotice])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isCheckingRef.current = false
    setIsActive(false)
  }

  const forceUpdate = useCallback(() => {
    console.log('🔄 Atualização forçada de avisos via polling')
    setLastUpdate(new Date())
    memoizedOnUpdate({ type: 'force_update', timestamp: new Date() })
  }, [memoizedOnUpdate])

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
    interval: Math.floor(interval / 1000)
  }
}