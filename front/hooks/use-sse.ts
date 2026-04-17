'use client'

import { useEffect, useRef, useCallback } from 'react'

type SSEHandler = (eventType: string, data: unknown) => void

/**
 * Connects to the /stream SSE endpoint and calls `onEvent` for each event.
 * Automatically reconnects on disconnection with exponential backoff.
 */
export function useSSE(onEvent: SSEHandler, enabled = true) {
  const esRef = useRef<EventSource | null>(null)
  const backoffRef = useRef(1000)

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/stream'
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('alert', (e) => {
      try { onEvent('alert', JSON.parse(e.data)) } catch {}
    })
    es.addEventListener('incident', (e) => {
      try { onEvent('incident', JSON.parse(e.data)) } catch {}
    })

    es.onopen = () => {
      backoffRef.current = 1000  // reset backoff on successful connection
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      // Reconnect with backoff (max 30s)
      const delay = Math.min(backoffRef.current, 30000)
      backoffRef.current = delay * 1.5
      setTimeout(connect, delay)
    }
  }, [enabled, onEvent])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      esRef.current = null
    }
  }, [connect])
}
