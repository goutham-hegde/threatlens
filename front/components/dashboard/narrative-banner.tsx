'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { fetchIncidents, fetchAlerts, startPolling } from '@/lib/api'
import type { BackendIncident, BackendAlert } from '@/lib/types'

export function NarrativeBanner() {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [narrativeText, setNarrativeText] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [elapsed, setElapsed] = useState<string | null>(null)
  const [elapsedTimer, setElapsedTimer] = useState<NodeJS.Timeout | null>(null)

  const buildNarrative = (incidents: BackendIncident[], alerts: BackendAlert[]): string => {
    if (incidents.length > 0) {
      const inc = incidents[0]
      const threatList = inc.threat_types.map(t => t.replace(/_/g, ' ')).join(' + ')
      const layerList = inc.layers.join(' + ')
      const topAlert = alerts.find(a => a.src_ip === inc.src_ip)
      const conf = topAlert ? `${Math.round(topAlert.confidence * 100)}%` : 'high'

      return `At ${new Date(inc.first_seen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}, ` +
        `IP ${inc.src_ip} triggered correlated signals across ${layerList} layers. ` +
        `Attack chain identified: ${threatList}. ` +
        `${inc.alert_count} alerts correlated into a CRITICAL cross-layer incident. ` +
        `Model confidence: ${conf}. Immediate containment recommended.`
    }

    const topAlert = alerts.find(a => a.threat_type !== 'benign')
    if (topAlert) {
      return `IP ${topAlert.src_ip} detected performing ${topAlert.threat_type.replace(/_/g, ' ')} — ` +
        `${topAlert.reason}. ` +
        `MITRE: ${topAlert.mitre_tags.join(', ')} | ` +
        `Kill chain stage: ${topAlert.kill_chain.stage}. ` +
        `Confidence: ${Math.round(topAlert.confidence * 100)}%.`
    }

    return 'All systems nominal. No active threats detected. Monitoring all layers continuously.'
  }

  const loadData = useCallback(async () => {
    try {
      const [incidents, alerts] = await Promise.all([fetchIncidents(), fetchAlerts(10)])
      const hasActiveThreats = incidents.length > 0 || alerts.some(a => a.threat_type !== 'benign')
      setIsLive(hasActiveThreats)

      const newNarrative = buildNarrative(incidents, alerts)

      if (newNarrative !== narrativeText) {
        setNarrativeText(newNarrative)
        setDisplayedText('')
        setIsComplete(false)

        // Track how long ago the most recent alert was
        if (hasActiveThreats) {
          const mostRecent = alerts[0]
          if (mostRecent) {
            const alertTime = new Date(mostRecent.timestamp).getTime()
            const updateElapsed = () => {
              const seconds = Math.floor((Date.now() - alertTime) / 1000)
              if (seconds < 60) setElapsed(`${seconds}s ago`)
              else setElapsed(`${Math.floor(seconds / 60)}m ${seconds % 60}s ago`)
            }
            updateElapsed()
            if (elapsedTimer) clearInterval(elapsedTimer)
            const timer = setInterval(updateElapsed, 1000)
            setElapsedTimer(timer)
          }
        } else {
          setElapsed(null)
        }
      }
    } catch {
      // Silent — keep last narrative
    }
  }, [narrativeText])

  // Initial + polling load
  useEffect(() => {
    const stop = startPolling(loadData, 6000)
    return () => {
      stop()
      if (elapsedTimer) clearInterval(elapsedTimer)
    }
  }, [loadData])

  // Typewriter animation
  useEffect(() => {
    if (!narrativeText) return
    let index = 0
    setDisplayedText('')
    setIsComplete(false)
    const interval = setInterval(() => {
      if (index < narrativeText.length) {
        setDisplayedText(narrativeText.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [narrativeText])

  return (
    <div className="bg-card rounded-xl border border-border p-5 relative overflow-hidden">
      {/* Left border accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLive ? 'bg-destructive' : 'bg-green-600'}`} />

      <div className="pl-4">
        {/* Status header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            {isLive ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
            )}
          </span>

          {isLive ? (
            <>
              <span className="text-sm font-semibold text-destructive tracking-wide animate-pulse">
                ACTIVE THREAT DETECTED
              </span>
              {elapsed && (
                <span className="text-sm text-muted-foreground">— {elapsed}</span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-green-600 tracking-wide">
              SYSTEM NOMINAL — All layers clear
            </span>
          )}
        </div>

        {/* Typewriter narrative */}
        <p className="text-sm text-foreground leading-relaxed font-mono mb-4 min-h-[4rem]">
          &ldquo;{displayedText}
          {!isComplete && <span className="animate-pulse">|</span>}
          {isComplete && '\u201D'}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="active:scale-95 transition-transform">
            View Full Timeline
          </Button>
          <Button variant="outline" size="sm" className="active:scale-95 transition-transform">
            Download Playbook
          </Button>
        </div>
      </div>
    </div>
  )
}
