'use client'

import { NarrativeBanner } from './narrative-banner'
import { KPICards } from './kpi-cards'
import { AlertFeed } from './alert-feed'
import { ThreatDistribution } from './threat-distribution'
import type { Alert } from '@/lib/types'

interface OverviewViewProps {
  onViewAlertDetails: (alert: Alert) => void
}

export function OverviewView({ onViewAlertDetails }: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Narrative Banner */}
      <NarrativeBanner />

      {/* KPI Cards */}
      <KPICards />

      {/* Main Grid: Alert Feed + Threat Distribution */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <AlertFeed onViewDetails={onViewAlertDetails} />
        </div>
        <div className="col-span-2">
          <ThreatDistribution />
        </div>
      </div>
    </div>
  )
}
