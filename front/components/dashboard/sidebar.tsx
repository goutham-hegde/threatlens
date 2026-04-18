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
<<<<<<< HEAD
    <aside className="w-[220px] h-screen bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 py-8 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 relative">
          <Shield className="w-6 h-6 text-primary" />
          <div className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-white text-lg tracking-tighter uppercase leading-none">ThreatLens</span>
          <span className="text-[9px] font-mono text-primary font-bold tracking-widest mt-1">v2.40.SOC</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-3">Command Center</div>
        <ul className="space-y-1">
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
          {navItems.map((item) => {
            const isActive = activeView === item.view
            return (
              <li key={item.view}>
                <button
                  onClick={() => onViewChange(item.view)}
                  className={cn(
<<<<<<< HEAD
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative group/btn',
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover/btn:scale-110"
                  )} />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  )}
=======
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-accent',
                    isActive 
                      ? 'bg-accent text-foreground relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-r-full' 
                      : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* System Status */}
<<<<<<< HEAD
      <div className="p-4 bg-black/40 border-t border-white/5">
=======
      <div className="p-4 border-t border-border">
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        <SystemStatus />
      </div>
    </aside>
  )
}

function SystemStatus() {
  return (
<<<<<<< HEAD
    <div className="bg-slate-900/40 rounded-2xl p-4 space-y-4 border border-white/5 relative overflow-hidden group">
      {/* Scanning effect overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="w-full h-[1px] bg-primary animate-scanning shadow-[0_0_15px_#3b82f6]" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-slate-400 tracking-wider">SEC-ENGINE</span>
        </div>
        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Uptime 99.9%</span>
      </div>
      
      <div className="space-y-3 relative z-10">
        <StatusBar label="NetFlow" value={847} max={1000} color="bg-blue-500" />
        <StatusBar label="CloudTrail" value={312} max={1000} color="bg-purple-500" />
        <StatusBar label="Endpoint" value={128} max={1000} color="bg-emerald-500" />
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      </div>
    </div>
  )
}

function StatusBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100
  
  return (
<<<<<<< HEAD
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300">{value} EPS</span>
=======
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-bold">{value} eps</span>
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn(
<<<<<<< HEAD
            "h-full rounded-full transition-all duration-1000 ease-out",
            color,
            "shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          )}
          style={{ width: `${percentage}%`, opacity: 0.7 }}
=======
            "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]",
            color
          )}
          style={{ width: `${percentage}%` }}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        />
      </div>
    </div>
  )
}
