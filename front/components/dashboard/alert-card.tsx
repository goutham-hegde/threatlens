'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/lib/mock-data'

interface AlertCardProps {
  alert: Alert
  onViewDetails: (alert: Alert) => void
  className?: string
}

const severityConfig: Record<Severity, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: 'bg-destructive', text: 'text-white', border: 'border-l-destructive shadow-[0_0_15px_-3px_rgba(220,38,38,0.3)]', label: 'CRITICAL' },
  high: { bg: 'bg-orange-500', text: 'text-white', border: 'border-l-orange-500', label: 'HIGH' },
  medium: { bg: 'bg-amber-500', text: 'text-white', border: 'border-l-amber-500', label: 'MEDIUM' },
  low: { bg: 'bg-green-600', text: 'text-white', border: 'border-l-green-600', label: 'LOW' },
  reviewed: { bg: 'bg-purple-600', text: 'text-white', border: 'border-l-purple-600', label: 'REVIEWED' }
}

export function AlertCard({ alert, onViewDetails, className }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = severityConfig[alert.severity]

  return (
    <div className={cn(
      'bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 border-l-4',
      config.border,
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {alert.severity === 'critical' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
          )}
          <span className={cn(
            'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
            config.bg, config.text
          )}>
            {config.label}
          </span>
          <span className="text-sm font-medium text-foreground">{alert.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <span className="text-xs font-medium text-foreground">{alert.confidence}%</span>
        {alert.confidenceTrend === 'up' ? (
          <ChevronUp className="w-3 h-3 text-green-600" />
        ) : (
          <ChevronDown className="w-3 h-3 text-destructive" />
        )}
        {/* Mini sparkline */}
        <svg width="30" height="10" className="ml-1">
          <polyline
            fill="none"
            stroke={alert.confidenceTrend === 'up' ? '#16a34a' : '#dc2626'}
            strokeWidth="1.5"
            points="0,8 6,6 12,7 18,4 24,3 30,1"
          />
        </svg>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

      {/* Tags */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {alert.layers.map(layer => (
            <span key={layer} className="px-2 py-0.5 rounded border border-border text-[10px] font-medium text-muted-foreground">
              {layer}
            </span>
          ))}
          {alert.mitreTags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-mono text-primary">
              {tag}
            </span>
          ))}
        </div>
        
        {alert.isReviewed ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-purple-600 hover:underline flex items-center gap-1"
          >
            Why not malicious?
            <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        ) : (
          <button
            onClick={() => onViewDetails(alert)}
            className="text-xs text-primary hover:underline"
          >
            View Details →
          </button>
        )}
      </div>

      {/* Review reasoning accordion */}
      {alert.isReviewed && isExpanded && alert.reviewReason && (
        <div className="mt-3 pt-3 border-t border-border">
          <ul className="space-y-1">
            {alert.reviewReason.map((reason, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-purple-600">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
