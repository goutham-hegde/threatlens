'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { cn } from '@/lib/utils'

const weeklyData = [
  { day: 'Mon', alerts: 145, incidents: 3, falsePositives: 12 },
  { day: 'Tue', alerts: 189, incidents: 5, falsePositives: 8 },
  { day: 'Wed', alerts: 234, incidents: 2, falsePositives: 15 },
  { day: 'Thu', alerts: 178, incidents: 4, falsePositives: 6 },
  { day: 'Fri', alerts: 312, incidents: 7, falsePositives: 11 },
  { day: 'Sat', alerts: 98, incidents: 1, falsePositives: 4 },
  { day: 'Sun', alerts: 87, incidents: 0, falsePositives: 3 }
]

const hourlyTrend = [
  { hour: '00:00', value: 45 },
  { hour: '02:00', value: 32 },
  { hour: '04:00', value: 28 },
  { hour: '06:00', value: 52 },
  { hour: '08:00', value: 89 },
  { hour: '10:00', value: 134 },
  { hour: '12:00', value: 156 },
  { hour: '14:00', value: 178 },
  { hour: '16:00', value: 145 },
  { hour: '18:00', value: 112 },
  { hour: '20:00', value: 78 },
  { hour: '22:00', value: 56 }
]

const mttrData = [
  { week: 'W1', mttr: 12.5 },
  { week: 'W2', mttr: 11.2 },
  { week: 'W3', mttr: 9.8 },
  { week: 'W4', mttr: 8.4 }
]


export function AnalyticsView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
            System <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time performance analytics and automated threat profiling
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AUTO-REFRESH: 30S
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Total Alerts" value="1,243" change="+18%" positive={false} />
        <MetricCard title="Detection Rate" value="97.2%" change="+2.1%" positive={true} />
        <MetricCard title="False Positive Rate" value="4.7%" change="-1.3%" positive={true} />
        <MetricCard title="Avg Response Time" value="4.2m" change="-22%" positive={true} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weekly Alert Trend */}
        <ChartContainer title="Weekly Alert Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="alerts" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Hourly Trend */}
        <ChartContainer title="Real-time Alert Volatility">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTrend}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#areaGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* MTTR Trend */}
        <ChartContainer title="Mean Time to Resolution (MTTR)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mttrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="mttr" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Incident Breakdown */}
        <ChartContainer title="Threat Composition Analysis">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="incidents" fill="#F43F5E" radius={[2, 2, 0, 0]} name="Incidents" />
              <Bar dataKey="falsePositives" fill="#8B5CF6" radius={[2, 2, 0, 0]} name="False Positives" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

function ChartContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
      <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">{title}</h3>
      <div className="h-64">
        {children}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-8">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-xs font-black text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-5 relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-black tracking-tighter",
          positive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {change}
        </div>
      </div>
      <div className="mt-3 w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", positive ? "bg-emerald-500" : "bg-rose-500")}
          style={{ width: '70%', opacity: 0.5 }}
        />
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
