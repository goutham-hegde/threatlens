'use client'

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
  const [filter, setFilter] = useState({
    layer: 'all',
    severity: 'all',
    timeRange: '1h'
  })

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
      </div>
    </div>
  )
}

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
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none group-hover:text-white transition-colors" />
    </div>
  )
}

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
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
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
                {detail}
              </span>
            ))}
          </div>
        </div>

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
          )} />
        </div>
      </div>

      {/* Expanded raw data */}
      {isExpanded && event.rawData && (
        <div className="px-4 pb-6 pl-[135px] animate-in slide-in-from-top-2 duration-300">
          <div className="bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] relative overflow-hidden group/pre">
            <div className="absolute top-0 right-0 p-2 text-[9px] text-slate-700 font-bold uppercase tracking-widest">
              Event Payload (JSON)
            </div>
            <pre className="text-emerald-400/90 leading-relaxed overflow-x-auto">
              {JSON.stringify(event.rawData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
