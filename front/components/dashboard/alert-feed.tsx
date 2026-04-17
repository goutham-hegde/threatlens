'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Pause, Play, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { AlertCard } from './alert-card'
import { adaptAlert } from '@/lib/types'
import type { Alert } from '@/lib/types'
import { fetchAlerts, startPolling } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AlertFeedProps {
  onViewDetails: (alert: Alert) => void
}

export function AlertFeed({ onViewDetails }: AlertFeedProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isStreaming, setIsStreaming] = useState(true)
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevIdsRef = useRef<Set<string>>(new Set())

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts(20)
      setIsConnected(true)
      setError(null)

      const adapted = data.map(adaptAlert)

      // Detect truly new alerts (not seen in previous fetch)
      const incoming = new Set<string>()
      for (const a of adapted) {
        if (!prevIdsRef.current.has(a.id)) {
          incoming.add(a.id)
        }
      }

      if (incoming.size > 0) {
        setNewAlertIds(prev => {
          const next = new Set(prev)
          incoming.forEach(id => next.add(id))
          return next
        })
        setTimeout(() => {
          setNewAlertIds(prev => {
            const next = new Set(prev)
            incoming.forEach(id => next.delete(id))
            return next
          })
        }, 600)
      }

      prevIdsRef.current = new Set(adapted.map(a => a.id))
      setAlerts(adapted)
    } catch (err) {
      setIsConnected(false)
      setError('Cannot reach backend — is the server running?')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // Polling loop
  useEffect(() => {
    if (!isStreaming) return
    const stop = startPolling(loadAlerts, 4000)
    return stop
  }, [isStreaming, loadAlerts])

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Live Alert Stream</span>

          {/* Connection indicator */}
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {isStreaming && <span className="text-xs text-green-600">Live</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive">Disconnected</span>
            </>
          )}

          {alerts.length > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              ({alerts.length} alerts)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadAlerts}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            title={isStreaming ? 'Pause polling' : 'Resume polling'}
          >
            {isStreaming ? (
              <Pause className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Play className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {isLoading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Connecting to detection engine…</p>
          </div>
        )}

        {error && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <WifiOff className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <p className="text-xs text-muted-foreground">
              Run a simulation to generate alerts
            </p>
          </div>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Wifi className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground">
              Go to Simulation → launch a scenario to generate live alerts
            </p>
          </div>
        )}

        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onViewDetails={onViewDetails}
            className={cn(
              'transition-all duration-300',
              newAlertIds.has(alert.id) && 'animate-in slide-in-from-top-2 fade-in'
            )}
          />
        ))}
      </div>
    </div>
  )
}
