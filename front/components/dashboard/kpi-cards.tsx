'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number
  suffix?: string
  trend: {
    value: string
    isPositive: boolean
  }
  subtext?: string
  icon?: React.ReactNode
}

function KPICard({ title, value, suffix = '', trend, subtext, icon }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
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
    return num.toLocaleString()
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
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
    </div>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        title="Total Alerts"
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
        icon={<Check className="w-3 h-3 text-green-600" />}
      />
      <KPICard
        title="Avg Confidence"
        value={91.4}
        suffix="%"
        trend={{ value: '↑ 3.2%', isPositive: true }}
      />
    </div>
  )
}
