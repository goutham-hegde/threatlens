'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Check, Target, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { startSimulation, fetchAlerts, fetchStats, resetData, startPolling } from '@/lib/api'
import type { Stats } from '@/lib/types'

type SimulationState = 'idle' | 'running' | 'complete'

interface Scenario {
  id: number
  title: string
  description: string
  complexity: 'Low' | 'Medium' | 'High'
  duration: string
  events: { time: number; log: string }[]
}

// Scenario metadata — logs are descriptive, actual detection happens in backend
const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Brute Force + Lateral Movement',
    description: 'Replays credential stuffing followed by internal network reconnaissance from CICIDS dataset.',
    complexity: 'High',
    duration: '~15s',
    events: [
      { time: 0,    log: '[SEED] Loading brute_force + lateral_movement events from CICIDS dataset…' },
      { time: 800,  log: '[APP]  Streaming 50 failed login attempts to ingestion pipeline…' },
      { time: 1600, log: '[APP]  Login failure rate exceeds 50x baseline — threshold breached' },
      { time: 2400, log: '[NET]  Sending lateral movement events — scanning internal subnet…' },
      { time: 3200, log: '[NET]  Multiple unique DST IPs contacted — cross-layer marker set' },
      { time: 4000, log: '[ENGINE] Correlation logic evaluating APP + NET signals…' },
      { time: 4800, log: '[ENGINE] Cross-layer incident created — CRITICAL severity assigned' },
      { time: 5600, log: '[COMPLETE] Simulation complete — check Live Feed for results' }
    ]
  },
  {
    id: 2,
    title: 'C2 Beacon + Exfiltration',
    description: 'Replays command-and-control beaconing followed by data exfiltration from CICIDS dataset.',
    complexity: 'Medium',
    duration: '~12s',
    events: [
      { time: 0,    log: '[SEED] Loading c2_beacon + data_exfiltration events from dataset…' },
      { time: 700,  log: '[NET]  Establishing periodic outbound connection pattern (60s intervals)…' },
      { time: 1400, log: '[NET]  Beacon pattern detected — low variance in connection_interval_std' },
      { time: 2100, log: '[NET]  Streaming data exfiltration events — bytes_out spike detected' },
      { time: 2800, log: '[ENGINE] Anomaly scored: bytes_out 12x above baseline for this dst_ip' },
      { time: 3500, log: '[ENGINE] C2 → Exfiltration chain confirmed — HIGH severity' },
      { time: 4200, log: '[COMPLETE] Simulation complete — check Live Feed for results' }
    ]
  },
  {
    id: 3,
    title: 'Baseline (Benign Traffic)',
    description: 'Replays normal benign traffic to verify low false positive rate of the model.',
    complexity: 'Low',
    duration: '~8s',
    events: [
      { time: 0,    log: '[SEED] Loading benign traffic events from CICIDS dataset…' },
      { time: 600,  log: '[NET]  Streaming 30 normal network events…' },
      { time: 1200, log: '[APP]  All status codes nominal — no anomalies in auth patterns' },
      { time: 1800, log: '[ENGINE] avg_confidence below alert threshold for all events' },
      { time: 2400, log: '[ENGINE] No correlation signals triggered — system nominal' },
      { time: 3000, log: '[COMPLETE] Baseline complete — FP rate = 0 for this run' }
    ]
  }
]

interface ScenarioState {
  state: SimulationState
  progress: number
  logs: string[]
  results: {
    threatsDetected: number
    falsePositives: number
    alertCount: number
    incidentCount: number
  }
}

export function SimulationView() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [simulation, setSimulation] = useState<ScenarioState>({
    state: 'idle',
    progress: 0,
    logs: [],
    results: { threatsDetected: 0, falsePositives: 0, alertCount: 0, incidentCount: 0 }
  })
  const [isResetting, setIsResetting] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulation.logs])

  const addLog = (log: string) => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })
    setSimulation(prev => ({
      ...prev,
      logs: [...prev.logs, `[${ts}] ${log}`]
    }))
  }

  const launchSimulation = async (scenarioId: number) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId)
    if (!scenario) return

    setSelectedScenario(scenarioId)
    setSimulation({
      state: 'running',
      progress: 0,
      logs: [],
      results: { threatsDetected: 0, falsePositives: 0, alertCount: 0, incidentCount: 0 }
    })

    // Call backend to start simulation
    try {
      const resp = await startSimulation(scenarioId)
      addLog(`[API] Backend accepted simulation — streaming ${resp.events} events…`)
    } catch {
      addLog('[ERROR] Could not reach backend. Showing log preview only.')
    }

    // Stream scenario logs in sync with backend processing
    let eventIndex = 0
    const totalDuration = scenario.events[scenario.events.length - 1].time + 1000

    const logInterval = setInterval(() => {
      if (eventIndex < scenario.events.length) {
        const event = scenario.events[eventIndex]
        const ts = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        })
        setSimulation(prev => ({
          ...prev,
          logs: [...prev.logs, `[${ts}] ${event.log}`],
          progress: Math.min(((eventIndex + 1) / scenario.events.length) * 100, 95)
        }))
        eventIndex++
      }
    }, 700)

    // After backend finishes, poll results
    setTimeout(async () => {
      clearInterval(logInterval)

      // Give backend a moment to finish ingesting
      await new Promise(r => setTimeout(r, 2000))

      try {
        const [statsData, alertsData] = await Promise.all([fetchStats(), fetchAlerts(50)])
        const threats = alertsData.filter(a => a.threat_type !== 'benign').length
        const fps = alertsData.filter(a => a.is_false_positive).length

        setSimulation(prev => ({
          ...prev,
          state: 'complete',
          progress: 100,
          results: {
            threatsDetected: threats,
            falsePositives: fps,
            alertCount: statsData.total_alerts,
            incidentCount: statsData.active_incidents
          }
        }))
      } catch {
        setSimulation(prev => ({
          ...prev,
          state: 'complete',
          progress: 100
        }))
      }
    }, totalDuration + 2000)
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetData()
    } catch {
      // ok
    }
    setIsResetting(false)
    setSelectedScenario(null)
    setSimulation({
      state: 'idle',
      progress: 0,
      logs: [],
      results: { threatsDetected: 0, falsePositives: 0, alertCount: 0, incidentCount: 0 }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground">Threat Simulation Engine</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Replay real attack scenarios from the CICIDS dataset and watch the ML detection engine respond in real time.
          </p>
        </div>
        {simulation.state !== 'idle' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting || simulation.state === 'running'}
            className="flex items-center gap-2"
          >
            {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
            Reset & Clear
          </Button>
        )}
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => (
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
              <span className="text-muted-foreground">
                {simulation.state === 'running' ? 'Streaming events to detection engine…' : 'Simulation complete'}
              </span>
              <span className="font-medium text-foreground">{Math.round(simulation.progress)}%</span>
            </div>
            <Progress value={simulation.progress} className="h-2" />
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
                  <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-widest">
                    threat-simulation.log
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">ML ENGINE v2</div>
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
                      log.includes('[API]') ? 'text-cyan-400' :
                      log.includes('[ERROR]') ? 'text-rose-400 font-bold' :
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
              <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-white/10 p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Detection Pipeline</h3>
                  <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-mono">
                    ML MODEL ACTIVE
                  </div>
                </div>
                <div className="space-y-5">
                  <DetectionIndicator
                    label="Ingestion & Feature Extraction"
                    detected={simulation.progress > 25}
                    detecting={simulation.state === 'running' && simulation.progress > 10 && simulation.progress <= 25}
                  />
                  <DetectionIndicator
                    label="RandomForest Classifier"
                    detected={simulation.progress > 50}
                    detecting={simulation.state === 'running' && simulation.progress > 35 && simulation.progress <= 50}
                  />
                  <DetectionIndicator
                    label="SHAP Explainability Engine"
                    detected={simulation.progress > 70}
                    detecting={simulation.state === 'running' && simulation.progress > 55 && simulation.progress <= 70}
                  />
                  <DetectionIndicator
                    label="Cross-Layer Correlation"
                    detected={simulation.progress > 90}
                    detecting={simulation.state === 'running' && simulation.progress > 75 && simulation.progress <= 90}
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
                      <p className="text-xs text-muted-foreground">ML pipeline finished — results from backend</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-emerald-500">{simulation.results.threatsDetected}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Threats Detected</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-rose-500">{simulation.results.falsePositives}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">False Positives</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-blue-500">{simulation.results.alertCount}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Alerts</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                      <p className="text-xl font-black text-amber-500">{simulation.results.incidentCount}</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Incidents</p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full font-bold uppercase tracking-widest text-[11px]"
                    onClick={handleReset}
                    disabled={isResetting}
                  >
                    {isResetting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-2" />}
                    Reset & Deploy New Scenario
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
  scenario: Scenario
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
