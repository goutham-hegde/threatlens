'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Check, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { simulationScenarios } from '@/lib/mock-data'
import { ScrollArea } from '@/components/ui/scroll-area'

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
          <div className="grid grid-cols-2 gap-6">
            {/* Terminal Log */}
            <div className="bg-[#020617] rounded-xl p-0 h-[400px] border border-white/10 overflow-hidden shadow-2xl relative">
              <div className="bg-slate-900 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-widest">threat-simulation.log</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">SSH v2.0</div>
              </div>
              <ScrollArea className="h-[360px] p-4 font-mono text-[11px] leading-relaxed">
                {simulation.logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      'py-0.5 animate-in fade-in slide-in-from-left-2 duration-300',
                      log.includes('[ENGINE]') ? 'text-blue-400 font-bold' :
                      log.includes('[COMPLETE]') ? 'text-emerald-400 font-bold' :
                      log.includes('[SEED]') ? 'text-indigo-400' :
                      log.includes('[APP]') ? 'text-purple-400' :
                      log.includes('[NET]') ? 'text-sky-400' :
                      'text-slate-300'
                    )}
                  >
                    <span className="opacity-40 mr-2">[{i.toString().padStart(3, '0')}]</span>
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
                {simulation.state === 'running' && (
                  <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse align-middle" />
                )}
              </ScrollArea>
            </div>

            {/* Detection Results */}
            <div className="space-y-4">
              <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-white/10 p-5 cyber-grid">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Detection Pipeline</h3>
                  <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-mono">
                    AI AGENT ACTIVE
                  </div>
                </div>
                <div className="space-y-5">
                  <DetectionIndicator
                    label="Credential Stuffing (App Layer)"
                    detected={simulation.progress > 30}
                    detecting={simulation.state === 'running' && simulation.progress > 20 && simulation.progress <= 30}
                  />
                  <DetectionIndicator
                    label="Internal Reconnaissance (Net Layer)"
                    detected={simulation.progress > 50}
                    detecting={simulation.state === 'running' && simulation.progress > 40 && simulation.progress <= 50}
                  />
                  <DetectionIndicator
                    label="Lateral Movement (Endpoint Layer)"
                    detected={simulation.progress > 70}
                    detecting={simulation.state === 'running' && simulation.progress > 60 && simulation.progress <= 70}
                  />
                  <DetectionIndicator
                    label="Cross-Layer correlation logic"
                    detected={simulation.progress > 90}
                    detecting={simulation.state === 'running' && simulation.progress > 80 && simulation.progress <= 90}
                  />
                </div>
              </div>

              {simulation.state === 'complete' && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 animate-in zoom-in-95 fade-in duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Analysis Complete</h3>
                      <p className="text-xs text-muted-foreground">Simulation report generated successfully</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-emerald-500">{simulation.results.threatsDetected}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Detected</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-rose-500">{simulation.results.falsePositives}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">False +</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-blue-500">{simulation.results.avgLatency}s</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Latency</p>
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full font-bold uppercase tracking-widest text-[11px]"
                    onClick={resetSimulation}
                  >
                    Deploy New Scenario
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
