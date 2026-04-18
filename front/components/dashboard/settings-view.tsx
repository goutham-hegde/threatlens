'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
<<<<<<< HEAD
import { Bell, Shield, Database, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
            Platform <span className="text-primary">Configuration</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fine-tune the ThreatLens detection engine and integration parameters
          </p>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">
          NODE: SOC-PROD-01
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Notification Settings */}
          <SettingsSection
            icon={Bell}
            title="Notification Pipeline"
            description="Manage alert distribution channels"
          >
            <div className="space-y-4">
              <SettingToggle
                label="Email Dispatches"
                description="Critical severity digests"
                defaultChecked={true}
              />
              <SettingToggle
                label="Slack Webhooks"
                description="Real-time incident streaming"
                defaultChecked={true}
              />
              <SettingToggle
                label="Mobile Push"
                description="Encrypted mobile alerts"
                defaultChecked={false}
              />
            </div>
          </SettingsSection>

          {/* Detection Settings */}
          <SettingsSection
            icon={Shield}
            title="Detection Parameters"
            description="Engine sensitivity and correlation logic"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Confidence Threshold</Label>
                  <span className="text-xs font-mono text-primary">85%</span>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    defaultValue="85" 
                    className="w-20 h-9 bg-black/40 border-white/10 font-mono text-xs"
                  />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </div>
                </div>
              </div>
              <SettingToggle
                label="Cross-Layer correlation"
                description="Auto-link disparate signals"
                defaultChecked={true}
              />
              <SettingToggle
                label="Heuristic Analysis"
                description="Detect pattern variations"
                defaultChecked={true}
              />
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          {/* Data Sources */}
          <SettingsSection
            icon={Database}
            title="Ingestion Nodes"
            description="Active data pipeline status"
          >
            <div className="space-y-2">
              <DataSourceRow name="NetFlow v9" status="connected" events="1,240 eps" />
              <DataSourceRow name="AppLogs (AWS S3)" status="connected" events="450 eps" />
              <DataSourceRow name="Endpoint (EDR)" status="connected" events="890 eps" />
              <DataSourceRow name="CloudTrail" status="degraded" events="12 eps" />
            </div>
          </SettingsSection>

          {/* API Settings */}
          <SettingsSection
            icon={Key}
            title="System Integration"
            description="Security keys and external hooks"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Master API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    value="sk-threat-lens-xxxxxxxxxxxxxxxx" 
                    readOnly
                    className="font-mono text-[11px] h-9 bg-black/40 border-white/10"
                  />
                  <Button variant="outline" size="sm" className="h-9 px-3 text-[10px] font-bold border-white/10 hover:bg-white/5">COPY</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">External Hook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    type="url" 
                    placeholder="https://api.soc.company.com/hooks"
                    className="text-[11px] h-9 bg-black/40 border-white/10"
                  />
                  <Button variant="outline" size="sm" className="h-9 px-3 text-[10px] font-bold border-white/10 hover:bg-white/5">TEST</Button>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all">
          Commit Config Changes
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        </Button>
      </div>
    </div>
  )
}

<<<<<<< HEAD
function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-slate-950/40 rounded-2xl border border-white/5 p-5 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{title}</h3>
          <p className="text-[11px] text-slate-500">{description}</p>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

function SettingToggle({ label, description, defaultChecked }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-[12px] font-bold text-slate-300">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

function DataSourceRow({ name, status, events }: DataSourceRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl transition-all">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
          status === 'degraded' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-600'
        )} />
        <span className="text-[12px] font-bold text-slate-300">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-slate-500">{events}</span>
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest",
          status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 
          status === 'degraded' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-500'
        )}>
          {status}
        </span>
      </div>
    </div>
  )
}

=======
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
interface SettingsSectionProps {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}

<<<<<<< HEAD
=======
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

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
interface SettingToggleProps {
  label: string
  description: string
  defaultChecked: boolean
}

<<<<<<< HEAD
interface DataSourceRowProps {
  name: string
  status: 'connected' | 'disconnected' | 'degraded'
  events: string
}
=======
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
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
