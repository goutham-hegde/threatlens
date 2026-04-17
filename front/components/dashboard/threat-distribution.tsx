'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { threatDistribution, severityBreakdown } from '@/lib/mock-data'

export function ThreatDistribution() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-6">
      {/* Donut Chart */}
      <div>
        <h3 className="font-medium text-foreground mb-4">Threat Distribution</h3>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={threatDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
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
              <p className="text-xs text-muted-foreground">Threats</p>
            </div>
          </div>
        </div>
        
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
        </div>
      </div>

      {/* Severity Breakdown */}
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
    </div>
  )
}
