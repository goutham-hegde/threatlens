'use client'

<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
=======
import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Check, AlertTriangle, ShieldCheck, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchStats, startPolling } from '@/lib/api'
import type { Stats } from '@/lib/types'
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

interface KPICardProps {
  title: string
  value: number
  suffix?: string
<<<<<<< HEAD
  trend: {
=======
  trend?: {
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    value: string
    isPositive: boolean
  }
  subtext?: string
  icon?: React.ReactNode
<<<<<<< HEAD
}

function KPICard({ title, value, suffix = '', trend, subtext, icon }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    
=======
  isLoading?: boolean
}

function KPICard({ title, value, suffix = '', trend, subtext, icon, isLoading }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 40
    const increment = value / steps
    let current = 0

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
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
<<<<<<< HEAD
=======
    if (suffix === '%') return num.toFixed(1)
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    return num.toLocaleString()
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
<<<<<<< HEAD
      <p className="text-3xl font-bold text-foreground mb-2">
        {formatNumber(displayValue)}{suffix}
      </p>
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
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    </div>
  )
}

export function KPICards() {
<<<<<<< HEAD
=======
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

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        title="Total Alerts"
<<<<<<< HEAD
        value={1247}
        trend={{ value: '↑ 18% vs 1h', isPositive: false }}
      />
      <KPICard
        title="Active Incidents"
        value={3}
        trend={{ value: '2 Critical', isPositive: false }}
      />
      <KPICard
        title="False Positives"
        value={1}
        trend={{ value: 'Reviewed', isPositive: true }}
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        icon={<Check className="w-3 h-3 text-green-600" />}
      />
      <KPICard
        title="Avg Confidence"
<<<<<<< HEAD
        value={91.4}
        suffix="%"
        trend={{ value: '↑ 3.2%', isPositive: true }}
=======
        value={avgConfidence}
        suffix="%"
        isLoading={isLoading}
        trend={{ value: avgConfidence >= 80 ? 'High confidence' : 'Low confidence', isPositive: avgConfidence >= 80 }}
        icon={<ShieldCheck className="w-3 h-3 text-muted-foreground" />}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      />
    </div>
  )
}
