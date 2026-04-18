'use client'

<<<<<<< HEAD
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { threatDistribution, severityBreakdown } from '@/lib/mock-data'

export function ThreatDistribution() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-6">
      {/* Donut Chart */}
=======
import { useEffect, useState, useCallback } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchStats, startPolling } from '@/lib/api'
import type { Stats } from '@/lib/types'

const THREAT_COLORS: Record<string, string> = {
  brute_force: '#2563EB',
  c2_beacon: '#EA580C',
  lateral_movement: '#D97706',
  data_exfiltration: '#16A34A',
  benign: '#6B7280'
}

const THREAT_LABELS: Record<string, string> = {
  brute_force: 'Brute Force',
  c2_beacon: 'C2 Beaconing',
  lateral_movement: 'Lateral Movement',
  data_exfiltration: 'Data Exfiltration',
  benign: 'Benign'
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A'
}

export function ThreatDistribution() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats()
      setStats(data)
    } catch {
      // Silent failure
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const stop = startPolling(loadStats, 6000)
    return stop
  }, [loadStats])

  // Build chart data from backend breakdown
  const threatData = stats
    ? Object.entries(stats.threat_breakdown)
        .filter(([k]) => k !== 'benign')
        .map(([key, value]) => ({
          name: THREAT_LABELS[key] || key,
          value,
          color: THREAT_COLORS[key] || '#6B7280'
        }))
    : []

  const severityData = stats
    ? ['critical', 'high', 'medium', 'low'].map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: stats.severity_breakdown[key] || 0,
        color: SEVERITY_COLORS[key]
      }))
    : []

  const totalThreats = threatData.reduce((acc, d) => acc + d.value, 0)
  const totalSeverity = severityData.reduce((acc, d) => acc + d.value, 0)

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-48 bg-muted rounded" />
      </div>
    )
  }

  if (!stats || totalThreats === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <p className="text-sm text-muted-foreground">No threat data yet</p>
        <p className="text-xs text-muted-foreground text-center">
          Run a simulation to populate charts
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-6">
      {/* Donut Chart — Threat Types */}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      <div>
        <h3 className="font-medium text-foreground mb-4">Threat Distribution</h3>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
<<<<<<< HEAD
                data={threatDistribution}
=======
                data={threatData}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
<<<<<<< HEAD
                animationDuration={1000}
              >
                {threatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">100%</p>
=======
                animationDuration={800}
              >
                {threatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalThreats}</p>
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
              <p className="text-xs text-muted-foreground">Threats</p>
            </div>
          </div>
        </div>
<<<<<<< HEAD
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {threatDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
              <span className="text-xs font-medium text-foreground ml-auto">{item.value}%</span>
            </div>
          ))}
=======

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {threatData.map((item) => {
            const pct = totalThreats > 0 ? Math.round((item.value / totalThreats) * 100) : 0
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                <span className="text-xs font-medium text-foreground ml-auto">{pct}%</span>
              </div>
            )
          })}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        </div>
      </div>

      {/* Severity Breakdown */}
<<<<<<< HEAD
      <div>
        <h3 className="font-medium text-foreground mb-3">Severity Breakdown</h3>
        <div className="space-y-2">
          {/* Stacked bar */}
          <div className="h-4 rounded-full overflow-hidden flex">
            {severityBreakdown.map((item, index) => {
              const total = severityBreakdown.reduce((acc, i) => acc + i.value, 0)
              const width = (item.value / total) * 100
              return (
                <div
                  key={item.name}
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${width}%`, 
                    backgroundColor: item.color,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              )
            })}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between">
            {severityBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-muted-foreground">{item.name}</span>
                <span className="text-[10px] font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
=======
      {totalSeverity > 0 && (
        <div>
          <h3 className="font-medium text-foreground mb-3">Severity Breakdown</h3>
          <div className="space-y-2">
            {/* Stacked bar */}
            <div className="h-4 rounded-full overflow-hidden flex">
              {severityData.filter(d => d.value > 0).map((item, index) => {
                const width = (item.value / totalSeverity) * 100
                return (
                  <div
                    key={item.name}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: item.color,
                      animationDelay: `${index * 100}ms`
                    }}
                    title={`${item.name}: ${item.value}`}
                  />
                )
              })}
            </div>

            {/* Labels */}
            <div className="flex justify-between flex-wrap gap-1">
              {severityData.filter(d => d.value > 0).map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                  <span className="text-[10px] font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    </div>
  )
}
