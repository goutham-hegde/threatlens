export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'reviewed'

export interface Alert {
  id: string
  severity: Severity
  title: string
  timestamp: string
  confidence: number
  confidenceTrend: 'up' | 'down'
  description: string
  layers: ('NET' | 'APP' | 'END')[]
  mitreTags: string[]
  ip?: string
  isReviewed?: boolean
  reviewReason?: string[]
}

export interface TimelineEvent {
  id: string
  timestamp: string
  layer: 'APP' | 'NET' | 'END' | 'SYSTEM'
  severity: Severity | 'system'
  title: string
  details: string[]
  isCrossLayer?: boolean
  rawData?: object
}

export const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Brute Force + Lateral Movement',
    timestamp: '02:47:03',
    confidence: 94,
    confidenceTrend: 'up',
    description: 'IP 192.168.1.45 made 312 failed login attempts in 60s, then pivoted to scan 7 internal hosts — cross-layer match.',
    layers: ['NET', 'APP'],
    mitreTags: ['T1110', 'T1021'],
    ip: '192.168.1.45'
  },
  {
    id: '2',
    severity: 'high',
    title: 'C2 Beacon Detection',
    timestamp: '02:44:18',
    confidence: 87,
    confidenceTrend: 'up',
    description: 'Regular outbound connections to suspicious domain every 60s. Pattern matches known C2 beacon behavior.',
    layers: ['NET'],
    mitreTags: ['T1071', 'T1573'],
    ip: '10.0.0.22'
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Unusual Port Scan Activity',
    timestamp: '02:41:55',
    confidence: 78,
    confidenceTrend: 'up',
    description: 'Internal host scanning 15 ports across subnet. Behavior inconsistent with normal operation profile.',
    layers: ['NET'],
    mitreTags: ['T1046'],
    ip: '192.168.1.102'
  },
  {
    id: '4',
    severity: 'reviewed',
    title: 'Data Exfiltration (False Positive)',
    timestamp: '01:33:17',
    confidence: 71,
    confidenceTrend: 'down',
    description: 'IP 10.0.0.8 transferred 2.1GB outbound. Downgraded: matches scheduled backup window for admin-backup-bot.',
    layers: ['NET'],
    mitreTags: ['T1048'],
    ip: '10.0.0.8',
    isReviewed: true,
    reviewReason: [
      'Transfer occurred during scheduled backup window (01:00-02:00 UTC)',
      'Source process identified as admin-backup-bot (verified service account)',
      'Destination IP matches approved backup storage endpoint'
    ]
  },
  {
    id: '5',
    severity: 'high',
    title: 'Privilege Escalation Attempt',
    timestamp: '02:38:42',
    confidence: 82,
    confidenceTrend: 'up',
    description: 'User "jsmith" attempted sudo access to sensitive directories 14 times in 2 minutes.',
    layers: ['END'],
    mitreTags: ['T1548', 'T1068'],
    ip: 'DESKTOP-4F2'
  },
  {
    id: '6',
    severity: 'low',
    title: 'Failed SSH Authentication',
    timestamp: '02:35:11',
    confidence: 65,
    confidenceTrend: 'down',
    description: 'Multiple failed SSH attempts from external IP. Rate within normal threshold but flagged for monitoring.',
    layers: ['NET', 'APP'],
    mitreTags: ['T1110'],
    ip: '203.45.67.89'
  }
]

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '02:47:03',
    layer: 'APP',
    severity: 'critical',
    title: '312 failed logins to /api/login from 192.168.1.45',
    details: ['Status: 401 × 312', 'Duration: 58s', 'User-Agent: python-requests/2.28'],
    rawData: {
      source_ip: '192.168.1.45',
      endpoint: '/api/login',
      status_codes: { '401': 312 },
      duration_seconds: 58,
      user_agent: 'python-requests/2.28',
      geo: { country: 'Unknown', asn: 'AS12345' }
    }
  },
  {
    id: '2',
    timestamp: '02:47:31',
    layer: 'NET',
    severity: 'high',
    title: 'Port scan initiated — 192.168.1.45 probing internal range',
    details: ['Ports: 22, 445, 3389', 'Hosts contacted: 3'],
    rawData: {
      source_ip: '192.168.1.45',
      ports_scanned: [22, 445, 3389],
      destination_hosts: ['10.0.0.5', '10.0.0.12', '10.0.0.18'],
      scan_type: 'SYN'
    }
  },
  {
    id: '3',
    timestamp: '02:51:17',
    layer: 'NET',
    severity: 'critical',
    title: 'Lateral movement confirmed — 7 internal hosts reached',
    details: ['Protocol: SMB', 'New connections: 7', 'Prev. connections: 0'],
    rawData: {
      source_ip: '192.168.1.45',
      protocol: 'SMB',
      new_connections: 7,
      previous_connections: 0,
      destination_hosts: ['10.0.0.5', '10.0.0.12', '10.0.0.18', '10.0.0.21', '10.0.0.33', '10.0.0.45', '10.0.0.67']
    }
  },
  {
    id: '4',
    timestamp: '02:51:17',
    layer: 'SYSTEM',
    severity: 'system',
    title: 'CROSS-LAYER INCIDENT CREATED — Severity escalated to CRITICAL',
    details: ['Correlated: APP signal (02:47:03) + NET signal (02:51:17)', 'Delta: 4m 14s'],
    isCrossLayer: true,
    rawData: {
      incident_id: 'INC-2026-0417-001',
      correlated_signals: ['APP-312-failed-logins', 'NET-lateral-movement'],
      time_delta_seconds: 254,
      escalation_reason: 'Cross-layer correlation: authentication attack followed by lateral movement'
    }
  },
  {
    id: '5',
    timestamp: '02:53:40',
    layer: 'END',
    severity: 'high',
    title: 'Suspicious process spawned on host DESKTOP-4F2',
    details: ['cmd.exe ← winword.exe', 'User: jsmith', 'Registry write detected'],
    rawData: {
      hostname: 'DESKTOP-4F2',
      parent_process: 'winword.exe',
      child_process: 'cmd.exe',
      user: 'jsmith',
      registry_key_modified: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
    }
  }
]

export const threatDistribution = [
  { name: 'Brute Force', value: 41, color: '#2563EB' },
  { name: 'C2 Beaconing', value: 28, color: '#EA580C' },
  { name: 'Lateral Movement', value: 19, color: '#D97706' },
  { name: 'Data Exfiltration', value: 12, color: '#16A34A' }
]

export const severityBreakdown = [
  { name: 'Critical', value: 12, color: '#DC2626' },
  { name: 'High', value: 34, color: '#EA580C' },
  { name: 'Medium', value: 67, color: '#D97706' },
  { name: 'Low', value: 134, color: '#16A34A' }
]

export const simulationScenarios = [
  {
    id: 1,
    title: 'Brute Force + Lateral Movement',
    description: 'Simulates credential stuffing followed by internal network reconnaissance',
    complexity: 'High',
    duration: '~2 min',
    events: [
      { time: 0, log: '[SEED] Starting brute force simulation against /api/login...' },
      { time: 400, log: '[APP] Generating 50 failed login attempts from 192.168.1.45...' },
      { time: 800, log: '[APP] Login failure rate exceeds threshold (50x baseline)' },
      { time: 1200, log: '[NET] Initiating port scan simulation...' },
      { time: 1600, log: '[NET] Scanning ports 22, 445, 3389 on internal subnet' },
      { time: 2000, log: '[NET] 3 hosts responded to probe' },
      { time: 2400, log: '[NET] Simulating SMB connections to internal hosts...' },
      { time: 2800, log: '[NET] 7 new SMB connections established' },
      { time: 3200, log: '[ENGINE] Cross-layer correlation triggered!' },
      { time: 3600, log: '[ENGINE] Incident created: CRITICAL severity' },
      { time: 4000, log: '[COMPLETE] Simulation finished. Awaiting detection results...' }
    ]
  },
  {
    id: 2,
    title: 'C2 Beacon + Exfiltration',
    description: 'Simulates command-and-control communication with data exfiltration',
    complexity: 'Medium',
    duration: '~3 min',
    events: [
      { time: 0, log: '[SEED] Initializing C2 beacon simulation...' },
      { time: 500, log: '[NET] Establishing periodic outbound connection pattern...' },
      { time: 1000, log: '[NET] Beacon interval set to 60 seconds' },
      { time: 1500, log: '[NET] Destination: suspicious-domain.com (known C2 indicator)' },
      { time: 2000, log: '[NET] 5 beacon cycles completed' },
      { time: 2500, log: '[NET] Initiating data exfiltration simulation...' },
      { time: 3000, log: '[NET] 500MB outbound transfer started' },
      { time: 3500, log: '[ENGINE] Anomaly detected: unusual outbound volume' },
      { time: 4000, log: '[ENGINE] C2 pattern matched with exfiltration behavior' },
      { time: 4500, log: '[COMPLETE] Simulation finished. Awaiting detection results...' }
    ]
  },
  {
    id: 3,
    title: 'Insider Threat Simulation',
    description: 'Simulates malicious insider accessing sensitive data outside normal patterns',
    complexity: 'High',
    duration: '~4 min',
    events: [
      { time: 0, log: '[SEED] Initializing insider threat simulation...' },
      { time: 600, log: '[APP] User "jsmith" logging in outside normal hours...' },
      { time: 1200, log: '[APP] Accessing sensitive directory /data/confidential...' },
      { time: 1800, log: '[END] Unusual file access pattern detected' },
      { time: 2400, log: '[END] 47 files accessed in 2 minutes (baseline: 5/hour)' },
      { time: 3000, log: '[NET] USB device connected to DESKTOP-4F2' },
      { time: 3600, log: '[END] Large file copy operation initiated' },
      { time: 4200, log: '[ENGINE] Insider threat score elevated' },
      { time: 4800, log: '[ENGINE] Cross-signal correlation: access + copy + USB' },
      { time: 5400, log: '[COMPLETE] Simulation finished. Awaiting detection results...' }
    ]
  }
]

export const shapFeatures = [
  { feature: 'failed_login_count', value: 0.82, label: 'Failed Login Count' },
  { feature: 'unique_dst_ips', value: 0.61, label: 'Unique Destination IPs' },
  { feature: 'connection_interval', value: 0.31, label: 'Connection Interval' },
  { feature: 'bytes_out', value: 0.18, label: 'Bytes Out' },
  { feature: 'known_admin_ip', value: -0.12, label: 'Known Admin IP' }
]

export const narrativeText = `At 02:47 AM, IP 192.168.1.45 began a credential stuffing attack against /api/login — 312 failed attempts in 60 seconds. Four minutes later, the same IP started scanning 7 internal hosts it had never contacted before. Our engine correlated both signals and escalated this to a CRITICAL cross-layer incident.`
