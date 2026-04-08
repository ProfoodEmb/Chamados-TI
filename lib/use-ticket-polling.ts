import { useEffect, useRef, useState } from "react"

interface TicketPollingOptions {
  ticketId: string
  onUpdate?: (ticket: any) => void
  enabled?: boolean
  interval?: number
}

export function useTicketPolling(options: TicketPollingOptions) {
  const { ticketId, onUpdate, enabled = true, interval = 8000 } = options
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isActive, setIsActive] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onUpdateRef = useRef(onUpdate)
  const lastMessageCountRef = useRef<number | null>(null)
  const lastAttachmentCountRef = useRef<number | null>(null)
  const lastStatusRef = useRef<string | null>(null)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const syncTicketState = (ticket: any, forceNotify = false) => {
    const currentMessageCount = ticket.messages?.length || 0
    const currentAttachmentCount = ticket.attachments?.length || 0
    const currentStatus = ticket.status || ""

    const isFirstLoad =
      lastMessageCountRef.current === null &&
      lastAttachmentCountRef.current === null &&
      lastStatusRef.current === null

    const hasChanges =
      forceNotify ||
      isFirstLoad ||
      currentMessageCount !== lastMessageCountRef.current ||
      currentAttachmentCount !== lastAttachmentCountRef.current ||
      currentStatus !== lastStatusRef.current

    if (hasChanges) {
      onUpdateRef.current?.(ticket)
    }

    lastMessageCountRef.current = currentMessageCount
    lastAttachmentCountRef.current = currentAttachmentCount
    lastStatusRef.current = currentStatus
    setLastUpdate(new Date())
  }

  const fetchCurrentTicket = async () => {
    const response = await fetch(`/api/tickets/${ticketId}`)

    if (!response.ok) {
      return null
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return null
    }

    return response.json()
  }

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }

    handleVisibilityChange()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !ticketId) {
      clearPolling()
      setIsActive(false)
      return
    }

    const checkForUpdates = async () => {
      try {
        const ticket = await fetchCurrentTicket()
        if (!ticket) {
          return
        }

        syncTicketState(ticket)
      } catch (error) {
        console.error("Erro no polling do ticket:", error)
      }
    }

    const startPolling = () => {
      clearPolling()
      intervalRef.current = setInterval(() => {
        void checkForUpdates()
      }, interval)
      setIsActive(true)
    }

    const stopPolling = () => {
      clearPolling()
      setIsActive(false)
    }

    const handleFocus = () => {
      if (!document.hidden) {
        void checkForUpdates()
      }
    }

    if (isPageVisible) {
      void checkForUpdates()
      startPolling()
    } else {
      stopPolling()
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      stopPolling()
      window.removeEventListener("focus", handleFocus)
    }
  }, [enabled, ticketId, interval, isPageVisible])

  const forceUpdate = async () => {
    try {
      const ticket = await fetchCurrentTicket()
      if (!ticket) {
        return
      }

      syncTicketState(ticket, true)
    } catch (error) {
      console.error("Erro na atualização manual do ticket:", error)
    }
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)

    if (diff < 60) {
      return `${diff}s atrás`
    }

    const minutes = Math.floor(diff / 60)
    return `${minutes}min atrás`
  }

  return {
    isActive,
    lastUpdate: formatLastUpdate(),
    forceUpdate,
    interval: Math.floor(interval / 1000),
  }
}
