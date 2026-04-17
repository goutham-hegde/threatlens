'use client'

import { X, Shield, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Alert, Severity } from '@/lib/mock-data'
import { shapFeatures } from '@/lib/mock-data'
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

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        'fixed right-0 top-0 h-screen w-[340px] bg-card border-l border-border z-50 transition-transform duration-300 ease-out',
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
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Shield className="w-12 h-12" />
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed relative z-10 font-medium italic">
                  "IP {alert.ip} triggered {alert.severity === 'critical' ? '312' : 'multiple'} failed authentication attempts 
                  against /api/login within 58 seconds. This was followed by SMB lateral movement attempts. 
                  Confidence is high due to the sequence of events matching known TTPs."
                </p>
              </div>
            </div>

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

            {/* Raw Event Data */}
            <Accordion type="single" collapsible>
              <AccordionItem value="raw-data" className="border-0">
                <AccordionTrigger className="text-sm font-medium py-2">
                  Raw Event Data
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-foreground text-background rounded-lg p-4 text-xs font-mono overflow-x-auto">
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
