'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Shield, Database, Key, Mail, Webhook } from 'lucide-react'

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your ThreatLens dashboard preferences
        </p>
      </div>

      {/* Notification Settings */}
      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Configure how you receive alerts"
      >
        <div className="space-y-4">
          <SettingToggle
            label="Email Notifications"
            description="Receive critical alerts via email"
            defaultChecked={true}
          />
          <SettingToggle
            label="Slack Integration"
            description="Send alerts to your Slack channel"
            defaultChecked={true}
          />
          <SettingToggle
            label="SMS Alerts"
            description="Get SMS for critical severity incidents"
            defaultChecked={false}
          />
        </div>
      </SettingsSection>

      {/* Detection Settings */}
      <SettingsSection
        icon={Shield}
        title="Detection Engine"
        description="Fine-tune detection sensitivity"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Confidence Threshold</Label>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                defaultValue="70" 
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">% minimum confidence to trigger alerts</span>
            </div>
          </div>
          <SettingToggle
            label="Cross-Layer Correlation"
            description="Automatically correlate signals across layers"
            defaultChecked={true}
          />
          <SettingToggle
            label="Auto-Escalation"
            description="Escalate incidents based on severity rules"
            defaultChecked={true}
          />
        </div>
      </SettingsSection>

      {/* Data Sources */}
      <SettingsSection
        icon={Database}
        title="Data Sources"
        description="Manage connected data pipelines"
      >
        <div className="space-y-3">
          <DataSourceRow name="Network Layer" status="connected" events="847 eps" />
          <DataSourceRow name="Application Layer" status="connected" events="312 eps" />
          <DataSourceRow name="Endpoint Layer" status="connected" events="128 eps" />
          <DataSourceRow name="Cloud WAF" status="disconnected" events="—" />
        </div>
      </SettingsSection>

      {/* API Settings */}
      <SettingsSection
        icon={Key}
        title="API Configuration"
        description="Manage API keys and webhooks"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">API Key</Label>
            <div className="flex gap-2">
              <Input 
                type="password" 
                value="sk-threat-lens-xxxxxxxxxxxxxxxx" 
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm">Regenerate</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Webhook URL</Label>
            <div className="flex gap-2">
              <Input 
                type="url" 
                placeholder="https://your-endpoint.com/webhook"
                className="text-sm"
              />
              <Button variant="outline" size="sm">Test</Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button className="active:scale-95 transition-transform">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

interface SettingsSectionProps {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pl-14">
        {children}
      </div>
    </div>
  )
}

interface SettingToggleProps {
  label: string
  description: string
  defaultChecked: boolean
}

function SettingToggle({ label, description, defaultChecked }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

interface DataSourceRowProps {
  name: string
  status: 'connected' | 'disconnected'
  events: string
}

function DataSourceRow({ name, status, events }: DataSourceRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-accent/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
        <span className="text-sm text-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">{events}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
        }`}>
          {status}
        </span>
      </div>
    </div>
  )
}
