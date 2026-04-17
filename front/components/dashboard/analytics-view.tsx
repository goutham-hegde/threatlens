'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts'
import { fetchStats, fetchAlerts, startPolling } from '@/lib/api'
import type { Stats } from '@/lib/types'

// Note: weekly/hourly historical data not stored by backend (in-memory)
// We built accumulated totals from current session

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

// Severity colors
const SEV_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A'
}

export function AnalyticsView() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alertHistory, setAlertHistory] = useState<{ time: string; alerts: number }[]>([])

  const loadData = useCallback(async () => {
    try {
      const data = await fetchStats()
      setStats(data)

      // Build a simple time-series snapshot each poll cycle
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      setAlertHistory(prev => {
        const next = [...prev, { time: now, alerts: data.total_alerts }]
        // Keep last 12 data points
        return next.slice(-12)
      })
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const stop = startPolling(loadData, 5000)
    return stop
  }, [loadData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading…</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="h-3 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Build threat distribution chart data
  const threatData = stats
    ? Object.entries(stats.threat_breakdown).map(([key, value]) => ({
        name: THREAT_LABELS[key] || key,
        value,
        color: THREAT_COLORS[key] || '#6B7280'
      }))
    : []

  const severityData = stats
    ? Object.entries(stats.severity_breakdown).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        fill: SEV_COLORS[key] || '#6B7280'
      }))
    : []

  const totalAlerts = stats?.total_alerts ?? 0
  const fpRate = totalAlerts > 0
    ? ((stats?.false_positives ?? 0) / totalAlerts * 100).toFixed(1)
    : '0.0'
  const avgConf = stats ? Math.round(stats.avg_confidence * 100 * 10) / 10 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time performance metrics from the ML detection engine
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Session Alerts"
          value={totalAlerts.toString()}
          change={`${stats?.active_incidents ?? 0} incidents`}
          positive={totalAlerts === 0}
        />
        <MetricCard
          title="Detection Confidence"
          value={`${avgConf}%`}
          change={avgConf >= 80 ? 'High confidence' : 'Low confidence'}
          positive={avgConf >= 80}
        />
        <MetricCard
          title="False Positive Rate"
          value={`${fpRate}%`}
          change={parseFloat(fpRate) < 10 ? 'Within threshold' : 'Review needed'}
          positive={parseFloat(fpRate) < 10}
        />
        <MetricCard
          title="False Positives"
          value={(stats?.false_positives ?? 0).toString()}
          change="AI-flagged"
          positive={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Alert trend (session) */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-1">Session Alert Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Cumulative alerts during this session</p>
          <div className="h-64">
            {alertHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Run a simulation to generate trend data
              </div>
            )}
          </div>
        </div>

        {/* Threat breakdown bar chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-1">Threat Type Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Alert counts by threat type (session)</p>
          <div className="h-64">
            {threatData.filter(d => d.value > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={threatData.filter(d => d.value > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {threatData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No threat data yet — run a simulation
              </div>
            )}
          </div>
        </div>

        {/* Severity distribution donut */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-1">Severity Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Alert severity breakdown (session)</p>
          <div className="h-64 flex items-center">
            {severityData.filter(d => d.value > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {severityData.filter(d => d.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
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
            ) : (
              <div className="flex items-center justify-center w-full text-muted-foreground text-sm">
                No severity data yet
              </div>
            )}
          </div>
          {severityData.filter(d => d.value > 0).length > 0 && (
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {severityData.filter(d => d.value > 0).map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                  <span className="text-xs font-bold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model stats */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">Model Performance</h3>
          <div className="space-y-4">
            <StatRow
              label="Average Confidence"
              value={`${avgConf}%`}
              percent={avgConf}
              color="#2563EB"
            />
            <StatRow
              label="False Positive Rate"
              value={`${fpRate}%`}
              percent={parseFloat(fpRate)}
              color="#DC2626"
            />
            <StatRow
              label="Threat Detection Coverage"
              value={`${totalAlerts > 0 ? Math.round(((totalAlerts - (stats?.false_positives ?? 0)) / totalAlerts) * 100) : 0}%`}
              percent={totalAlerts > 0 ? ((totalAlerts - (stats?.false_positives ?? 0)) / totalAlerts) * 100 : 0}
              color="#16A34A"
            />

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-widest">Model Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Algorithm</span>
                  <span className="font-medium text-foreground">RandomForest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Explainability</span>
                  <span className="font-medium text-foreground">SHAP TreeExplainer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training data</span>
                  <span className="font-medium text-foreground">CICIDS-2017</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classes</span>
                  <span className="font-medium text-foreground">5 threat types</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  positive: boolean
}

function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-destructive'}`}>
        {change}
      </p>
    </div>
  )
}

function StatRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
