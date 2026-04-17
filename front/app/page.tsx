'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'
import { OverviewView } from '@/components/dashboard/overview-view'
import { TimelineView } from '@/components/dashboard/timeline-view'
import { SimulationView } from '@/components/dashboard/simulation-view'
import { AnalyticsView } from '@/components/dashboard/analytics-view'
import { SettingsView } from '@/components/dashboard/settings-view'
import { AlertDetailPanel } from '@/components/dashboard/alert-detail-panel'
import { AlertFeed } from '@/components/dashboard/alert-feed'
import { LandingPage } from '@/components/dashboard/landing-page'
import type { Alert } from '@/lib/mock-data'

export default function DashboardPage() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)

  const handleEnterDashboard = () => {
    setShowLanding(false)
  }

  const handleViewAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert)
    setIsDetailPanelOpen(true)
  }

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setTimeout(() => setSelectedAlert(null), 300)
  }

  const handleRunSimulation = () => {
    setActiveView('simulation')
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView onViewAlertDetails={handleViewAlertDetails} />
      case 'live-feed':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Live Feed</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time stream of all security alerts across all layers
              </p>
            </div>
            <AlertFeed onViewDetails={handleViewAlertDetails} />
          </div>
        )
      case 'timeline':
        return <TimelineView />
      case 'simulation':
        return <SimulationView />
      case 'analytics':
        return <AnalyticsView />
      case 'settings':
        return <SettingsView />
      default:
        return <OverviewView onViewAlertDetails={handleViewAlertDetails} />
    }
  }

  if (showLanding) {
    return <LandingPage onEnter={handleEnterDashboard} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="pl-[220px]">
        {/* Top Bar */}
        <TopBar currentView={activeView} onRunSimulation={handleRunSimulation} />

        {/* Page Content */}
        <main className="p-6">
          {renderView()}
        </main>
      </div>

      {/* Alert Detail Panel */}
      <AlertDetailPanel
        alert={selectedAlert}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
      />
    </div>
  )
}
