'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface TopBarProps {
  currentView: string
  onRunSimulation: () => void
}

export function TopBar({ currentView, onRunSimulation }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getViewTitle = (view: string) => {
    const titles: Record<string, string> = {
      'overview': 'Overview',
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
    </div>
  )
}
