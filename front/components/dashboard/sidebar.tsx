'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Radar,
  Network,
  Play,
  BarChart2,
  Settings,
  Shield
} from 'lucide-react'

type NavItem = {
  icon: React.ElementType
  label: string
  view: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', view: 'overview' },
  { icon: Radar, label: 'Live Feed', view: 'live-feed' },
  { icon: Network, label: 'Incident Timeline', view: 'timeline' },
  { icon: Play, label: 'Simulation Mode', view: 'simulation' },
  { icon: BarChart2, label: 'Analytics', view: 'analytics' },
  { icon: Settings, label: 'Settings', view: 'settings' }
]

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-[220px] h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">ThreatLens</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = activeView === item.view
            return (
              <li key={item.view}>
                <button
                  onClick={() => onViewChange(item.view)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent',
                    isActive 
                      ? 'bg-accent text-foreground relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full' 
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-border">
        <SystemStatus />
      </div>
    </aside>
  )
}

function SystemStatus() {
  return (
    <div className="bg-accent/50 rounded-xl p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-medium text-foreground">Ingesting</span>
        <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">LIVE</span>
      </div>
      
      <div className="space-y-2">
        <StatusBar label="Network layer" value={847} max={1000} />
        <StatusBar label="App layer" value={312} max={1000} />
        <StatusBar label="Endpoint" value={128} max={1000} />
      </div>
    </div>
  )
}

function StatusBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{value} eps</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
