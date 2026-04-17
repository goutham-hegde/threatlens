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
    <div className="bg-accent/30 backdrop-blur-sm rounded-xl p-3 space-y-3 border border-white/5 relative overflow-hidden">
      {/* Scanning effect overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="w-full h-[2px] bg-primary animate-scanning shadow-[0_0_10px_#3b82f6]" />
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold text-foreground tracking-tight">INGESTING ENGINE</span>
        <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">LIVE</span>
      </div>
      
      <div className="space-y-2 relative z-10">
        <StatusBar label="Network layer" value={847} max={1000} color="bg-blue-500" />
        <StatusBar label="App layer" value={312} max={1000} color="bg-purple-500" />
        <StatusBar label="Endpoint" value={128} max={1000} color="bg-orange-500" />
      </div>
    </div>
  )
}

function StatusBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-bold">{value} eps</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]",
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
