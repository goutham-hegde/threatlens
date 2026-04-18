'use client'

<<<<<<< HEAD
import { X, Shield, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/lib/mock-data'
import { shapFeatures } from '@/lib/mock-data'
=======
import { X, Shield, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/lib/types'
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AlertDetailPanelProps {
  alert: Alert | null
  isOpen: boolean
  onClose: () => void
}

const severityConfig: Record<Severity, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-destructive', text: 'text-white', label: 'CRITICAL' },
  high: { bg: 'bg-orange-500', text: 'text-white', label: 'HIGH' },
  medium: { bg: 'bg-amber-500', text: 'text-white', label: 'MEDIUM' },
  low: { bg: 'bg-green-600', text: 'text-white', label: 'LOW' },
  reviewed: { bg: 'bg-purple-600', text: 'text-white', label: 'REVIEWED' }
}

export function AlertDetailPanel({ alert, isOpen, onClose }: AlertDetailPanelProps) {
  if (!alert) return null

  const config = severityConfig[alert.severity]
<<<<<<< HEAD
=======
  const raw = alert.raw

  // SHAP features: use real ones from backend, or empty array
  const shapFeatures = raw?.shap_features ?? []
  const maxShap = Math.max(...shapFeatures.map(f => Math.abs(f.value)), 0.01)

  // Playbook: use real ones from backend
  const playbook = raw?.playbook

  // Kill chain from backend
  const killChain = raw?.kill_chain
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

  return (
    <>
      {/* Overlay */}
<<<<<<< HEAD
      <div 
=======
      <div
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
<<<<<<< HEAD
      
      {/* Panel */}
      <div className={cn(
        'fixed right-0 top-0 h-screen w-[340px] bg-card border-l border-border z-50 transition-transform duration-300 ease-out',
=======

      {/* Panel */}
      <div className={cn(
        'fixed right-0 top-0 h-screen w-[380px] bg-card border-l border-border z-50 transition-transform duration-300 ease-out',
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <ScrollArea className="h-full">
          <div className="p-5 space-y-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="space-y-2 pr-8">
<<<<<<< HEAD
              <span className={cn(
                'px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block',
                config.bg, config.text
              )}>
                {config.label}
              </span>
              <h2 className="text-lg font-semibold text-foreground">{alert.title}</h2>
              <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
            </div>

            {/* Plain-English Explanation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-primary/10 rounded">
                  <span className="text-primary text-xs">AI</span>
                </span>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">System Narrative</h3>
=======
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide inline-block',
                  config.bg, config.text
                )}>
                  {config.label}
                </span>
                {alert.isReviewed && (
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                    False Positive
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{alert.title}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{alert.timestamp}</span>
                {alert.ip && <span className="font-mono bg-accent px-2 py-0.5 rounded">{alert.ip}</span>}
              </div>
              {killChain && killChain.stage !== 'None' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Kill Chain:</span>
                  <span className="text-xs font-semibold text-primary">{killChain.stage}</span>
                  <span className="text-xs text-muted-foreground">→ {killChain.next}</span>
                </div>
              )}
            </div>

            {/* MITRE Tags */}
            {alert.mitreTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {alert.mitreTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded bg-primary/10 text-primary text-[11px] font-mono font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* AI Narrative */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-primary/10 rounded">
                  <span className="text-primary text-xs font-bold">AI</span>
                </span>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">System Narrative</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {alert.confidence}% confidence
                </span>
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Shield className="w-12 h-12" />
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed relative z-10 font-medium italic">
<<<<<<< HEAD
                  "IP {alert.ip} triggered {alert.severity === 'critical' ? '312' : 'multiple'} failed authentication attempts 
                  against /api/login within 58 seconds. This was followed by SMB lateral movement attempts. 
                  Confidence is high due to the sequence of events matching known TTPs."
=======
                  &ldquo;{alert.description}&rdquo;
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                </p>
              </div>
            </div>

<<<<<<< HEAD
            {/* SHAP Feature Importance */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Explainability — <span className="text-xs font-normal text-muted-foreground">SHAP Values</span>
              </h3>
              <div className="space-y-3 p-4 bg-accent/20 rounded-xl border border-white/5">
                {shapFeatures.map((feature) => (
                  <div key={feature.feature} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">{feature.label}</span>
                      <span className={cn(
                        'font-mono font-bold px-1.5 py-0.5 rounded',
                        feature.value > 0 ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-white/5'
                      )}>
                        {feature.value > 0 ? '+' : ''}{feature.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.3)]',
                          feature.value > 0 ? 'bg-gradient-to-r from-blue-600 to-primary' : 'bg-slate-600'
                        )}
                        style={{ width: `${Math.abs(feature.value) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playbook */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>⚡</span> Playbook — Actionable Intelligence
              </h3>
              
              <Accordion type="multiple" defaultValue={['immediate']} className="space-y-3">
                <AccordionItem value="immediate" className="border border-white/10 rounded-xl px-4 bg-card/50">
                  <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                    Phase 1: Containment
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded border border-primary/50 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-primary opacity-0 group-hover:opacity-100" />
                        </div>
                        <span className="text-foreground/80">Block IP <code className="bg-white/5 px-1 rounded">{alert.ip}</code> at perimeter</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded border border-primary/50 flex items-center justify-center shrink-0" />
                        <span className="text-foreground/80">Quarantine affected assets</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="short-term" className="border border-white/10 rounded-xl px-4 bg-card/50">
                  <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                    Phase 2: Investigation
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-xs text-muted-foreground mb-3 font-mono">Run the following simulation to verify detectability:</p>
                    <div className="bg-foreground text-background rounded p-2 text-[10px] font-mono mb-3">
                      $ threat-engine --simulate lateral-mvmt --target {alert.ip}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
=======
            {/* SHAP Feature Importance — real data from ML model */}
            {shapFeatures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Explainability — <span className="text-xs font-normal text-muted-foreground">SHAP Values (from model)</span>
                </h3>
                <div className="space-y-3 p-4 bg-accent/20 rounded-xl border border-white/5">
                  {shapFeatures
                    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                    .slice(0, 6)
                    .map((feature) => (
                    <div key={feature.name} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">{feature.name.replace(/_/g, ' ')}</span>
                        <span className={cn(
                          'font-mono font-bold px-1.5 py-0.5 rounded',
                          feature.value > 0 ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-white/5'
                        )}>
                          {feature.value > 0 ? '+' : ''}{feature.value.toFixed(3)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            feature.value > 0
                              ? 'bg-gradient-to-r from-blue-600 to-primary'
                              : 'bg-slate-600'
                          )}
                          style={{ width: `${(Math.abs(feature.value) / maxShap) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Playbook — real from ML model */}
            {playbook && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>⚡</span> Playbook — Actionable Intelligence
                </h3>

                <Accordion type="multiple" defaultValue={['immediate']} className="space-y-3">
                  <AccordionItem value="immediate" className="border border-white/10 rounded-xl px-4 bg-card/50">
                    <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                      Phase 1: Immediate Containment
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="space-y-3 text-sm">
                        {playbook.immediate.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded border border-primary/50 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 text-primary opacity-50" />
                            </div>
                            <span className="text-foreground/80">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="short_term" className="border border-white/10 rounded-xl px-4 bg-card/50">
                    <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                      Phase 2: Investigation
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <ul className="space-y-3 text-sm">
                        {playbook.short_term.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded border border-border flex items-center justify-center shrink-0" />
                            <span className="text-foreground/80">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {playbook.escalate_if && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-destructive mb-1">⚠ Escalate If:</p>
                    <p className="text-xs text-muted-foreground">{playbook.escalate_if}</p>
                  </div>
                )}
              </div>
            )}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

            {/* Raw Event Data */}
            <Accordion type="single" collapsible>
              <AccordionItem value="raw-data" className="border-0">
                <AccordionTrigger className="text-sm font-medium py-2">
                  Raw Event Data
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-foreground text-background rounded-lg p-4 text-xs font-mono overflow-x-auto">
<<<<<<< HEAD
{JSON.stringify({
  alert_id: alert.id,
  severity: alert.severity,
  source_ip: alert.ip,
  timestamp: alert.timestamp,
  confidence_score: alert.confidence / 100,
  mitre_techniques: alert.mitreTags,
  layers: alert.layers,
  description: alert.description
}, null, 2)}
=======
                    {JSON.stringify(raw ?? {
                      alert_id: alert.id,
                      severity: alert.severity,
                      source_ip: alert.ip,
                      timestamp: alert.timestamp,
                      confidence_score: alert.confidence / 100,
                      mitre_techniques: alert.mitreTags,
                      layers: alert.layers,
                      description: alert.description
                    }, null, 2)}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
