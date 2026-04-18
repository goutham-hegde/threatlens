'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
<<<<<<< HEAD
import { cn } from '@/lib/utils'
=======
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

interface TopBarProps {
  currentView: string
  onRunSimulation: () => void
}

export function TopBar({ currentView, onRunSimulation }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
<<<<<<< HEAD
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
=======
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
<<<<<<< HEAD
      day: 'numeric'
    }).toUpperCase()
=======
      day: 'numeric',
      year: 'numeric'
    })
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
<<<<<<< HEAD
      hour12: false
=======
      hour12: true
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    })
  }

  const getViewTitle = (view: string) => {
    const titles: Record<string, string> = {
      'overview': 'Overview',
<<<<<<< HEAD
      'live-feed': 'Real-time Feed',
      'timeline': 'Correlation Timeline',
      'simulation': 'Cyber Range',
      'analytics': 'Intelligence Hub',
      'settings': 'Terminal Config'
    }
    return titles[view] || 'Dashboard'
  }

  return (
    <div className="h-16 border-b border-white/5 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Active View</span>
          <span className="text-sm font-black text-white uppercase tracking-wider">{getViewTitle(currentView)}</span>
        </div>
        
        <div className="h-8 w-px bg-white/10" />

        {currentTime && (
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">System Time (UTC)</span>
            <span className="text-xs font-mono text-slate-300 font-bold tracking-tight">
              {formatDate(currentTime)} // {formatTime(currentTime)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 mr-2">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Global Threat Level</span>
            <span className="text-[10px] font-bold text-rose-500">ELEVATED (BETA-3)</span>
          </div>
          <div className="w-2 h-8 flex flex-col gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn("flex-1 rounded-sm w-full", i > 1 ? "bg-rose-500" : "bg-white/10")} />
            ))}
          </div>
        </div>

        <Button 
          onClick={onRunSimulation}
          className="h-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] px-6 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 mr-2 fill-current" />
          Start Simulation
        </Button>
      </div>
=======
      'live-feed': 'Live Feed',
      'timeline': 'Incident Timeline',
      'simulation': 'Simulation Mode',
      'analytics': 'Analytics',
      'settings': 'Settings'
    }
    return titles[view] || 'Overview'
  }

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">{getViewTitle(currentView)}</span>
        {currentTime && (
          <>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(currentTime)} — {formatTime(currentTime)}
            </span>
          </>
        )}
      </div>

      <Button 
        onClick={onRunSimulation}
        className="bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 transition-transform"
      >
        <Play className="w-4 h-4 mr-2" />
        Run Simulation
      </Button>
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    </div>
  )
}
