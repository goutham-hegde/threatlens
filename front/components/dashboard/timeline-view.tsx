'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adaptTimelineEvent } from '@/lib/types'
import type { TimelineEvent, Severity } from '@/lib/types'
import { fetchTimeline, startPolling } from '@/lib/api'
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
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    layer: 'all',
    severity: 'all',
    timeRange: '1h'
  })

  const loadTimeline = useCallback(async () => {
    try {
      const data = await fetchTimeline()
      const adapted = data.map(adaptTimelineEvent)
      // Sort newest first
      setEvents(adapted.reverse())
    } catch {
      // Silent failure
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const stop = startPolling(loadTimeline, 5000)
    return stop
  }, [loadTimeline])

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Filtering
  const filtered = events.filter(e => {
    if (filter.layer !== 'all' && e.layer !== filter.layer) return false
    if (filter.severity !== 'all' && e.severity !== filter.severity) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return e.title.toLowerCase().includes(q) || e.details.some(d => d.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cross-Layer Incident Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize correlated security events across all detection layers
          </p>
        </div>
        <button
          onClick={loadTimeline}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isLoading && 'animate-spin')} />
        </button>
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
            { value: 'END', label: 'Endpoint' },
            { value: 'SYSTEM', label: 'System' }
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
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {events.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} / {events.length} events
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading timeline…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <p className="text-sm">No timeline events yet</p>
            <p className="text-xs text-center">
              Run a simulation or ingest events to build the incident timeline
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((event) => (
              <TimelineEventRow
                key={event.id}
                event={event}
                isExpanded={expandedIds.has(event.id)}
                onToggle={() => toggleExpanded(event.id)}
              />
            ))}
          </div>
        )}
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
  const severityInfo = severityIcons[event.severity] ?? severityIcons.low
  const layerColor = layerColors[event.layer] || 'bg-gray-100 text-gray-700'

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
            <span className="text-sm font-medium text-foreground truncate">{event.title}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
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
