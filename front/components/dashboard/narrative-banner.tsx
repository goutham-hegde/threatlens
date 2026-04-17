'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { narrativeText } from '@/lib/mock-data'

export function NarrativeBanner() {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < narrativeText.length) {
        setDisplayedText(narrativeText.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card rounded-xl border border-border p-5 relative overflow-hidden">
      {/* Blue left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      
      <div className="pl-4">
        {/* Active incident header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
          </span>
          <span className="text-sm font-semibold text-destructive tracking-wide animate-pulse">
            ACTIVE INCIDENT IN PROGRESS
          </span>
          <span className="text-sm text-muted-foreground">— Detected 3m 42s ago</span>
        </div>

        {/* Typewriter narrative text */}
        <p className="text-sm text-foreground leading-relaxed font-mono mb-4 min-h-[4rem]">
          &ldquo;{displayedText}
          {!isComplete && <span className="animate-pulse">|</span>}
          {isComplete && '&rdquo;'}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="active:scale-95 transition-transform">
            View Full Timeline
          </Button>
          <Button variant="outline" size="sm" className="active:scale-95 transition-transform">
            Download Playbook
          </Button>
        </div>
      </div>
    </div>
  )
}
