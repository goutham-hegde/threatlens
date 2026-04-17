'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance metrics and threat intelligence insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Weekly Alerts" value="1,243" change="+18%" positive={false} />
        <MetricCard title="Detection Rate" value="97.2%" change="+2.1%" positive={true} />
        <MetricCard title="False Positive Rate" value="4.7%" change="-1.3%" positive={true} />
        <MetricCard title="Avg Response Time" value="4.2m" change="-22%" positive={true} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weekly Alert Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">Weekly Alert Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="alerts" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">Today&apos;s Alert Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563EB" 
                  fill="#2563EB" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MTTR Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">Mean Time to Resolution (minutes)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mttr" 
                  stroke="#16A34A" 
                  strokeWidth={2}
                  dot={{ fill: '#16A34A', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">Weekly Incident Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="incidents" fill="#DC2626" radius={[4, 4, 0, 0]} name="Incidents" />
                <Bar dataKey="falsePositives" fill="#7C3AED" radius={[4, 4, 0, 0]} name="False Positives" />
              </BarChart>
            </ResponsiveContainer>
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
      <p className={`text-xs ${positive ? 'text-green-600' : 'text-destructive'}`}>
        {change} vs last week
      </p>
    </div>
  )
}
