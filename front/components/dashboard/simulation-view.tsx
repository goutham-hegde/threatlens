'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Check, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { simulationScenarios } from '@/lib/mock-data'

type SimulationState = 'idle' | 'running' | 'complete'

interface ScenarioState {
  state: SimulationState
  progress: number
  logs: string[]
  results: {
    threatsDetected: number
    falsePositives: number
    avgLatency: number
  }
}

export function SimulationView() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [simulation, setSimulation] = useState<ScenarioState>({
    state: 'idle',
    progress: 0,
    logs: [],
    results: { threatsDetected: 0, falsePositives: 0, avgLatency: 0 }
  })
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulation.logs])

  const launchSimulation = (scenarioId: number) => {
    const scenario = simulationScenarios.find(s => s.id === scenarioId)
    if (!scenario) return

    setSelectedScenario(scenarioId)
    setSimulation({
      state: 'running',
      progress: 0,
      logs: [],
      results: { threatsDetected: 0, falsePositives: 0, avgLatency: 0 }
    })

    // Simulate log events
    let eventIndex = 0
    const totalDuration = scenario.events[scenario.events.length - 1].time + 1000

    const logInterval = setInterval(() => {
      if (eventIndex < scenario.events.length) {
        const event = scenario.events[eventIndex]
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: false 
        })
        
        setSimulation(prev => ({
          ...prev,
          logs: [...prev.logs, `[${timestamp}] ${event.log}`],
          progress: Math.min(((eventIndex + 1) / scenario.events.length) * 100, 99)
        }))
        eventIndex++
      }
    }, 400)

    // Complete simulation
    setTimeout(() => {
      clearInterval(logInterval)
      setSimulation(prev => ({
        ...prev,
        state: 'complete',
        progress: 100,
        results: {
          threatsDetected: 3,
          falsePositives: 1,
          avgLatency: 4.2
        }
      }))
    }, totalDuration)
  }

  const resetSimulation = () => {
    setSelectedScenario(null)
    setSimulation({
      state: 'idle',
      progress: 0,
      logs: [],
      results: { threatsDetected: 0, falsePositives: 0, avgLatency: 0 }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-foreground">Threat Simulation Engine</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Replay pre-seeded attack scenarios and watch the detection engine respond in real time.
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-4">
        {simulationScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedScenario === scenario.id}
            isDisabled={simulation.state === 'running'}
            onLaunch={() => launchSimulation(scenario.id)}
          />
        ))}
      </div>

      {/* Simulation Progress */}
      {simulation.state !== 'idle' && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Simulation Progress</span>
              <span className="font-medium text-foreground">{Math.round(simulation.progress)}%</span>
            </div>
            <div className="relative">
              <Progress value={simulation.progress} className="h-2" />
              {simulation.state === 'running' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>
          </div>

          {/* Split view: Terminal + Results */}
          <div className="grid grid-cols-2 gap-4">
            {/* Terminal Log */}
            <div className="bg-[#0F172A] rounded-xl p-4 h-80 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 ml-2">simulation.log</span>
              </div>
              <div className="h-[calc(100%-2rem)] overflow-y-auto font-mono text-xs">
                {simulation.logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      'py-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200',
                      log.includes('[ENGINE]') ? 'text-amber-400' :
                      log.includes('[COMPLETE]') ? 'text-green-400' :
                      log.includes('[SEED]') ? 'text-blue-400' :
                      'text-green-500'
                    )}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
                {simulation.state === 'running' && (
                  <span className="text-green-500 animate-pulse">▌</span>
                )}
              </div>
            </div>

            {/* Detection Results */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">Detection Progress</h3>
                <div className="space-y-3">
                  <DetectionIndicator
                    label="Brute Force Attack"
                    detected={simulation.progress > 30}
                    detecting={simulation.state === 'running' && simulation.progress > 20 && simulation.progress <= 30}
                  />
                  <DetectionIndicator
                    label="Port Scanning"
                    detected={simulation.progress > 50}
                    detecting={simulation.state === 'running' && simulation.progress > 40 && simulation.progress <= 50}
                  />
                  <DetectionIndicator
                    label="Lateral Movement"
                    detected={simulation.progress > 70}
                    detecting={simulation.state === 'running' && simulation.progress > 60 && simulation.progress <= 70}
                  />
                  <DetectionIndicator
                    label="Cross-Layer Correlation"
                    detected={simulation.progress > 90}
                    detecting={simulation.state === 'running' && simulation.progress > 80 && simulation.progress <= 90}
                  />
                </div>
              </div>

              {simulation.state === 'complete' && (
                <div className="bg-card rounded-xl border border-border p-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Simulation Complete
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{simulation.results.threatsDetected}</p>
                      <p className="text-xs text-muted-foreground">Threats Detected</p>
                    </div>
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{simulation.results.falsePositives}</p>
                      <p className="text-xs text-muted-foreground">False Positives</p>
                    </div>
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{simulation.results.avgLatency}s</p>
                      <p className="text-xs text-muted-foreground">Avg Latency</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={resetSimulation}
                  >
                    Run Another Simulation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ScenarioCardProps {
  scenario: typeof simulationScenarios[0]
  isSelected: boolean
  isDisabled: boolean
  onLaunch: () => void
}

function ScenarioCard({ scenario, isSelected, isDisabled, onLaunch }: ScenarioCardProps) {
  return (
    <div className={cn(
      'bg-card rounded-xl border border-border p-5 transition-all duration-200',
      'hover:border-primary hover:shadow-md',
      isSelected && 'border-primary ring-2 ring-primary/20',
      isDisabled && !isSelected && 'opacity-50 pointer-events-none'
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground text-sm">Scenario {scenario.id}</h3>
          <p className="text-sm font-medium text-foreground">{scenario.title}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{scenario.description}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>Complexity: <span className="text-foreground font-medium">{scenario.complexity}</span></span>
        <span>Duration: <span className="text-foreground font-medium">{scenario.duration}</span></span>
      </div>

      <Button 
        size="sm" 
        className="w-full active:scale-95 transition-transform"
        onClick={onLaunch}
        disabled={isDisabled}
      >
        <Play className="w-3 h-3 mr-2" />
        Launch
      </Button>
    </div>
  )
}

function DetectionIndicator({ label, detected, detecting }: { label: string; detected: boolean; detecting: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
        detected ? 'bg-green-100' : detecting ? 'bg-amber-100 animate-pulse' : 'bg-muted'
      )}>
        {detected ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : detecting ? (
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        )}
      </div>
    </div>
  )
}
