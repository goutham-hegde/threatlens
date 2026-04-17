'use client'

import { X } from 'lucide-react'
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Why was this flagged?</h3>
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  IP {alert.ip} triggered {alert.severity === 'critical' ? '312' : 'multiple'} failed authentication attempts 
                  against /api/login within 58 seconds — 52× above the baseline for this endpoint. The same IP then 
                  appeared in network logs making SMB connections to 7 hosts it had zero prior history with.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  The combination of failed auth → internal scanning is a textbook post-compromise lateral movement 
                  pattern (MITRE {alert.mitreTags.join(' → ')}).
                </p>
              </div>
            </div>

            {/* SHAP Feature Importance */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">What drove this decision</h3>
              <div className="space-y-2">
                {shapFeatures.map((feature) => (
                  <div key={feature.feature} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{feature.label}</span>
                      <span className={cn(
                        'font-mono',
                        feature.value > 0 ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {feature.value > 0 ? '+' : ''}{feature.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          feature.value > 0 ? 'bg-primary' : 'bg-muted-foreground/30'
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
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <span>📋</span> Recommended Response — {alert.title}
              </h3>
              
              <Accordion type="multiple" defaultValue={['immediate', 'short-term', 'escalate']} className="space-y-2">
                <AccordionItem value="immediate" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    Immediate (0–15 min)
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">├─</span>
                        Block IP {alert.ip} at perimeter firewall
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">├─</span>
                        Force password reset for all accounts that received requests
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">└─</span>
                        Isolate affected host from internal network
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="short-term" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    Short-term (15–60 min)
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">├─</span>
                        Pull full auth logs for the past 24h on /api/login
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">├─</span>
                        Check for any successful logins from this IP before block
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">└─</span>
                        Review SMB access logs on the contacted hosts
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="escalate" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    Escalate if...
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">└─</span>
                        Any of the internal hosts show outbound data spikes
                      </li>
                    </ul>
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
