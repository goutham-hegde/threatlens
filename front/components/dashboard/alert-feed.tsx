'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pause, Play } from 'lucide-react'
import { AlertCard } from './alert-card'
import { mockAlerts, type Alert, type Severity } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface AlertFeedProps {
  onViewDetails: (alert: Alert) => void
}

const additionalAlerts: Alert[] = [
  {
    id: 'new-1',
    severity: 'high',
    title: 'Anomalous DNS Query Pattern',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).slice(0, 8),
    confidence: 79,
    confidenceTrend: 'up',
    description: 'Host 10.0.0.44 making DNS queries to randomized subdomains — potential DNS tunneling activity.',
    layers: ['NET'],
    mitreTags: ['T1071.004'],
    ip: '10.0.0.44'
  },
  {
    id: 'new-2',
    severity: 'medium',
    title: 'Unusual Process Execution',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).slice(0, 8),
    confidence: 72,
    confidenceTrend: 'up',
    description: 'PowerShell spawned from Excel macro on DESKTOP-7X2. Matches common malware delivery pattern.',
    layers: ['END'],
    mitreTags: ['T1059.001'],
    ip: 'DESKTOP-7X2'
  },
  {
    id: 'new-3',
    severity: 'critical',
    title: 'Potential Ransomware Activity',
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).slice(0, 8),
    confidence: 91,
    confidenceTrend: 'up',
    description: 'Rapid file encryption detected on SERVER-DB1. 847 files modified in 30 seconds with entropy increase.',
    layers: ['END', 'APP'],
    mitreTags: ['T1486'],
    ip: 'SERVER-DB1'
  }
]

export function AlertFeed({ onViewDetails }: AlertFeedProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [isStreaming, setIsStreaming] = useState(true)
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set())

  const addNewAlert = useCallback(() => {
    const severities: Severity[] = ['critical', 'high', 'medium', 'low']
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
    const randomAlert = additionalAlerts[Math.floor(Math.random() * additionalAlerts.length)]
    
    const newAlert: Alert = {
      ...randomAlert,
      id: `alert-${Date.now()}`,
      severity: randomSeverity,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).slice(0, 8)
    }
    
    setNewAlertIds(prev => new Set(prev).add(newAlert.id))
    setAlerts(prev => [newAlert, ...prev.slice(0, 7)])
    
    // Remove the "new" status after animation completes
    setTimeout(() => {
      setNewAlertIds(prev => {
        const next = new Set(prev)
        next.delete(newAlert.id)
        return next
      })
    }, 500)
  }, [])

  useEffect(() => {
    if (!isStreaming) return
    
    const interval = setInterval(addNewAlert, 5000)
    return () => clearInterval(interval)
  }, [isStreaming, addNewAlert])

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Live Alert Stream</span>
          {isStreaming && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600">Streaming</span>
            </>
          )}
        </div>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          {isStreaming ? (
            <Pause className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Play className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Alert list */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
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
