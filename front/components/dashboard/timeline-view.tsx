'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockTimelineEvents, type TimelineEvent, type Severity } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const severityIcons: Record<Severity | 'system', { icon: string; color: string }> = {
  critical: { icon: '🔴', color: 'text-destructive' },
  high: { icon: '🟠', color: 'text-orange-500' },
  medium: { icon: '🟡', color: 'text-amber-500' },
  low: { icon: '🟢', color: 'text-green-600' },
  reviewed: { icon: '🟣', color: 'text-purple-600' },
  system: { icon: '⚡', color: 'text-amber-500' }
}

const layerColors: Record<string, string> = {
  APP: 'bg-blue-100 text-blue-700',
  NET: 'bg-green-100 text-green-700',
  END: 'bg-purple-100 text-purple-700',
  SYSTEM: 'bg-amber-100 text-amber-700'
}

export function TimelineView() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState({
    layer: 'all',
    severity: 'all',
    timeRange: '1h'
  })

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Cross-Layer Incident Timeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize correlated security events across all detection layers
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <FilterDropdown
          label="All Layers"
          value={filter.layer}
          onChange={(v) => setFilter(prev => ({ ...prev, layer: v }))}
          options={[
            { value: 'all', label: 'All Layers' },
            { value: 'APP', label: 'Application' },
            { value: 'NET', label: 'Network' },
            { value: 'END', label: 'Endpoint' }
          ]}
        />
        <FilterDropdown
          label="All Severities"
          value={filter.severity}
          onChange={(v) => setFilter(prev => ({ ...prev, severity: v }))}
          options={[
            { value: 'all', label: 'All Severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ]}
        />
        <FilterDropdown
          label="Last 1h"
          value={filter.timeRange}
          onChange={(v) => setFilter(prev => ({ ...prev, timeRange: v }))}
          options={[
            { value: '1h', label: 'Last 1h' },
            { value: '6h', label: 'Last 6h' },
            { value: '24h', label: 'Last 24h' },
            { value: '7d', label: 'Last 7 days' }
          ]}
        />
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            className="pl-9"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border">
        <div className="divide-y divide-border">
          {mockTimelineEvents.map((event) => (
            <TimelineEventRow
              key={event.id}
              event={event}
              isExpanded={expandedIds.has(event.id)}
              onToggle={() => toggleExpanded(event.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FilterDropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FilterDropdown({ value, onChange, options }: FilterDropdownProps) {
  const selectedOption = options.find(o => o.value === value)
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm text-foreground cursor-pointer hover:bg-accent transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

interface TimelineEventRowProps {
  event: TimelineEvent
  isExpanded: boolean
  onToggle: () => void
}

function TimelineEventRow({ event, isExpanded, onToggle }: TimelineEventRowProps) {
  const severityInfo = severityIcons[event.severity]
  const layerColor = layerColors[event.layer]

  return (
    <div 
      className={cn(
        'group transition-all duration-300',
        event.isCrossLayer && 'bg-amber-50/50'
      )}
    >
      <div 
        className="flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        {/* Timestamp */}
        <div className="w-20 flex-shrink-0">
          <span className="text-sm font-mono text-muted-foreground">{event.timestamp}</span>
        </div>

        {/* Timeline dot */}
        <div className="relative flex flex-col items-center">
          <div className={cn(
            'w-3 h-3 rounded-full border-2 bg-card',
            event.isCrossLayer ? 'border-amber-500 ring-4 ring-amber-200' : 'border-border'
          )}>
            {event.isCrossLayer && (
              <span className="absolute -left-1 -top-1 text-sm">{severityInfo.icon}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', layerColor)}>
              {event.layer}
            </span>
            {!event.isCrossLayer && (
              <span className="text-sm">{severityInfo.icon}</span>
            )}
            <span className="text-sm font-medium text-foreground">{event.title}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {event.details.map((detail, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-border">|</span>}
                {detail}
              </span>
            ))}
          </div>
        </div>

        {/* Expand indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </div>

      {/* Expanded raw data */}
      {isExpanded && event.rawData && (
        <div className="px-4 pb-4 pl-28">
          <pre className="bg-foreground text-background rounded-lg p-4 text-xs font-mono overflow-x-auto">
            {JSON.stringify(event.rawData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
