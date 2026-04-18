'use client'

<<<<<<< HEAD
import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockTimelineEvents, type TimelineEvent, type Severity } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const severityIcons: Record<Severity | 'system', { icon: string; color: string; glow: string }> = {
  critical: { icon: '🔴', color: 'text-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
  high: { icon: '🟠', color: 'text-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' },
  medium: { icon: '🟡', color: 'text-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
  low: { icon: '🟢', color: 'text-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
  reviewed: { icon: '🟣', color: 'text-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
  system: { icon: '⚡', color: 'text-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' }
}

const layerColors: Record<string, string> = {
  APP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  NET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  END: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SYSTEM: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

export function TimelineView() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
  const [filter, setFilter] = useState({
    layer: 'all',
    severity: 'all',
    timeRange: '1h'
  })

<<<<<<< HEAD
  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      return next
    })
  }

<<<<<<< HEAD
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
            Cross-Layer <span className="text-primary">Incident Timeline</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Temporal correlation of signals across the entire attack surface
          </p>
        </div>
        <div className="text-[10px] font-mono text-primary animate-pulse bg-primary/5 px-2 py-1 rounded border border-primary/20">
          LIVE STREAM ACTIVE • V2.4
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 p-2 bg-black/20 backdrop-blur-md rounded-xl border border-white/5">
        <FilterDropdown
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
          value={filter.layer}
          onChange={(v) => setFilter(prev => ({ ...prev, layer: v }))}
          options={[
            { value: 'all', label: 'All Layers' },
            { value: 'APP', label: 'Application' },
            { value: 'NET', label: 'Network' },
<<<<<<< HEAD
            { value: 'END', label: 'Endpoint' }
          ]}
        />
        <FilterDropdown
=======
            { value: 'END', label: 'Endpoint' },
            { value: 'SYSTEM', label: 'System' }
          ]}
        />
        <FilterDropdown
          label="All Severities"
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
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
<<<<<<< HEAD
        <div className="h-6 w-px bg-white/10 mx-1" />
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search payload metadata, IPs, or event titles..." 
            className="pl-9 h-10 bg-white/5 border-white/10 text-sm focus:ring-primary/40 focus:border-primary/40"
          />
        </div>
        <Button variant="ghost" size="sm" className="text-xs font-mono text-slate-500 hover:text-white">
          EXPORT.CSV
        </Button>
      </div>

      {/* Timeline Container */}
      <div className="relative bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden">
        <div className="absolute left-[115px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0" />
        
        <div className="divide-y divide-white/5">
          {mockTimelineEvents.map((event) => (
            <TimelineEventRow
              key={event.id}
              event={event}
              isExpanded={expandedIds.has(event.id)}
              onToggle={() => toggleExpanded(event.id)}
            />
          ))}
        </div>
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      </div>
    </div>
  )
}

<<<<<<< HEAD
function FilterDropdown({ value, onChange, options }: FilterDropdownProps) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 cursor-pointer hover:bg-white/10 hover:text-white transition-all"
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-white">
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
            {option.label}
          </option>
        ))}
      </select>
<<<<<<< HEAD
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none group-hover:text-white transition-colors" />
=======
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    </div>
  )
}

<<<<<<< HEAD
function TimelineEventRow({ event, isExpanded, onToggle }: TimelineEventRowProps) {
  const severityInfo = severityIcons[event.severity]
  const layerColor = layerColors[event.layer]

  return (
    <div 
      className={cn(
        'group transition-all duration-300 relative',
        event.isCrossLayer ? 'bg-primary/[0.03]' : 'hover:bg-white/[0.02]'
      )}
    >
      <div 
        className="flex items-center gap-6 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Timestamp */}
        <div className="w-[85px] text-right">
          <span className="text-[11px] font-mono text-slate-500 group-hover:text-primary transition-colors">
            {event.timestamp}
          </span>
        </div>

        {/* Timeline dot */}
        <div className="relative flex items-center justify-center w-6 z-10">
          <div className={cn(
            'w-2.5 h-2.5 rounded-full border-2 transition-all duration-300',
            event.isCrossLayer 
              ? 'bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.6)] scale-125' 
              : 'bg-slate-800 border-slate-600 group-hover:border-slate-400'
          )} />
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
<<<<<<< HEAD
          <div className="flex items-center gap-3 mb-1.5">
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border', layerColor)}>
              {event.layer}
            </span>
            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
              {event.title}
            </span>
            {event.isCrossLayer && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30 animate-pulse">
                CORRELATED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            {event.details.map((detail, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-700" />}
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                {detail}
              </span>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Severity */}
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', severityInfo.color, severityInfo.glow)} />
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', severityInfo.color)}>
            {event.severity}
          </span>
        </div>

        {/* Expand indicator */}
        <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className={cn(
            'w-4 h-4 text-slate-500 transition-transform duration-300',
            isExpanded && 'rotate-180 text-primary'
=======
        {/* Expand indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
          )} />
        </div>
      </div>

      {/* Expanded raw data */}
      {isExpanded && event.rawData && (
<<<<<<< HEAD
        <div className="px-4 pb-6 pl-[135px] animate-in slide-in-from-top-2 duration-300">
          <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] relative overflow-hidden group/pre">
            <div className="absolute top-0 right-0 p-2 text-[9px] text-slate-700 font-bold uppercase tracking-widest">
              Event Payload (JSON)
            </div>
            <pre className="text-emerald-400/90 leading-relaxed overflow-x-auto">
              {JSON.stringify(event.rawData, null, 2)}
            </pre>
          </div>
=======
        <div className="px-4 pb-4 pl-28">
          <pre className="bg-foreground text-background rounded-lg p-4 text-xs font-mono overflow-x-auto">
            {JSON.stringify(event.rawData, null, 2)}
          </pre>
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        </div>
      )}
    </div>
  )
}
