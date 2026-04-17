'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Check, AlertTriangle, ShieldCheck, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchStats, startPolling } from '@/lib/api'
import type { Stats } from '@/lib/types'

interface KPICardProps {
  title: string
  value: number
  suffix?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  subtext?: string
  icon?: React.ReactNode
  isLoading?: boolean
}

function KPICard({ title, value, suffix = '', trend, subtext, icon, isLoading }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 40
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  const formatNumber = (num: number) => {
    if (suffix === '%') return num.toFixed(1)
    return num.toLocaleString()
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      {isLoading ? (
        <div className="h-9 w-20 bg-muted animate-pulse rounded mb-2" />
      ) : (
        <p className="text-3xl font-bold text-foreground mb-2">
          {formatNumber(displayValue)}{suffix}
        </p>
      )}
      {trend && (
        <div className="flex items-center gap-2">
          {icon}
          <span className={cn(
            'text-xs font-medium flex items-center gap-1',
            trend.isPositive ? 'text-green-600' : 'text-destructive'
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </span>
          {subtext && (
            <span className="text-xs text-muted-foreground">{subtext}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function KPICards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats()
      setStats(data)
    } catch {
      // Silent failure — keep last known values
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const stop = startPolling(loadStats, 5000)
    return stop
  }, [loadStats])

  const totalAlerts = stats?.total_alerts ?? 0
  const activeIncidents = stats?.active_incidents ?? 0
  const falsePositives = stats?.false_positives ?? 0
  const avgConfidence = stats ? Math.round(stats.avg_confidence * 100 * 10) / 10 : 0

  const criticalCount = stats?.severity_breakdown?.critical ?? 0

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        title="Total Alerts"
        value={totalAlerts}
        isLoading={isLoading}
        trend={{ value: `${criticalCount} Critical`, isPositive: criticalCount === 0 }}
        icon={<Activity className="w-3 h-3 text-muted-foreground" />}
      />
      <KPICard
        title="Active Incidents"
        value={activeIncidents}
        isLoading={isLoading}
        trend={{
          value: activeIncidents === 0 ? 'None active' : `${activeIncidents} open`,
          isPositive: activeIncidents === 0
        }}
        icon={<AlertTriangle className="w-3 h-3 text-muted-foreground" />}
      />
      <KPICard
        title="False Positives"
        value={falsePositives}
        isLoading={isLoading}
        trend={{ value: 'AI-reviewed', isPositive: true }}
        icon={<Check className="w-3 h-3 text-green-600" />}
      />
      <KPICard
        title="Avg Confidence"
        value={avgConfidence}
        suffix="%"
        isLoading={isLoading}
        trend={{ value: avgConfidence >= 80 ? 'High confidence' : 'Low confidence', isPositive: avgConfidence >= 80 }}
        icon={<ShieldCheck className="w-3 h-3 text-muted-foreground" />}
      />
    </div>
  )
}
