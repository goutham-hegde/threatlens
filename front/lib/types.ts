// ─── Shared Types (aligned with FastAPI backend schema) ───────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'reviewed'
export type ThreatType = 'brute_force' | 'lateral_movement' | 'c2_beacon' | 'data_exfiltration' | 'false_positive' | 'benign'
export type Layer = 'NET' | 'APP' | 'END' | 'network' | 'app' | 'endpoint'

// Normalizes backend layer strings to frontend display labels
export function normalizeLayer(layer: string): 'NET' | 'APP' | 'END' | 'SYSTEM' {
  switch (layer?.toLowerCase()) {
    case 'network': return 'NET'
    case 'app': return 'APP'
    case 'endpoint': return 'END'
    default: return (layer?.toUpperCase() as 'NET' | 'APP' | 'END' | 'SYSTEM') || 'NET'
  }
}

// ─── Backend Alert (raw from /alerts endpoint) ────────────────────────────────
export interface BackendAlert {
  id: string
  timestamp: string
  src_ip: string
  dst_ip: string
  endpoint: string
  layer: string
  threat_type: ThreatType
  severity: Severity
  confidence: number
  mitre_tags: string[]
  kill_chain: {
    stage: string
    stage_idx: number
    next: string
  }
  reason: string
  is_false_positive: boolean
  shap_features: { name: string; value: number }[]
  playbook: {
    immediate: string[]
    short_term: string[]
    escalate_if: string
  }
}

// ─── Frontend Alert (used by UI components) ──────────────────────────────────
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
  // Rich backend data (available when alert comes from backend)
  raw?: BackendAlert
}

// ─── Convert backend alert → frontend Alert ──────────────────────────────────
export function adaptAlert(a: BackendAlert): Alert {
  const layerNorm = normalizeLayer(a.layer)
  const finalLayer = (layerNorm === 'SYSTEM' ? 'NET' : layerNorm) as 'NET' | 'APP' | 'END'
  return {
    id: a.id,
    severity: a.is_false_positive ? 'reviewed' : a.severity,
    title: formatThreatTitle(a.threat_type),
    timestamp: formatTimestamp(a.timestamp),
    confidence: Math.round(a.confidence * 100),
    confidenceTrend: 'up',
    description: a.reason,
    layers: [finalLayer],
    mitreTags: a.mitre_tags,
    ip: a.src_ip,
    isReviewed: a.is_false_positive,
    reviewReason: a.is_false_positive
      ? ['Identified as false positive by AI engine', `Source: ${a.src_ip}`]
      : undefined,
    raw: a
  }
}

function formatThreatTitle(threat: ThreatType): string {
  const map: Record<ThreatType, string> = {
    brute_force: 'Brute Force Attack',
    lateral_movement: 'Lateral Movement',
    c2_beacon: 'C2 Beacon Detection',
    data_exfiltration: 'Data Exfiltration',
    false_positive: 'False Positive',
    benign: 'Benign Activity'
  }
  return map[threat] || threat
}

export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch {
    return iso
  }
}

// ─── Backend Incident ─────────────────────────────────────────────────────────
export interface BackendIncident {
  id: string
  src_ip: string
  severity: string
  layers: string[]
  alert_count: number
  first_seen: string
  last_seen: string
  threat_types: string[]
  summary: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export interface Stats {
  total_alerts: number
  active_incidents: number
  false_positives: number
  avg_confidence: number
  threat_breakdown: Record<string, number>
  severity_breakdown: Record<string, number>
}

// ─── Timeline Event ───────────────────────────────────────────────────────────
export interface BackendTimelineEvent {
  timestamp: string
  layer: string
  severity: string
  event: string
  src_ip?: string
  threat_type?: string
  mitre_tags?: string[]
  is_correlation: boolean
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

export function adaptTimelineEvent(e: BackendTimelineEvent, index: number): TimelineEvent {
  const layer = normalizeLayer(e.layer)
  return {
    id: `te-${index}-${e.timestamp}`,
    timestamp: formatTimestamp(e.timestamp),
    layer: layer,
    severity: e.is_correlation ? 'system' : (e.severity as Severity),
    title: e.event,
    details: [
      e.src_ip ? `Src: ${e.src_ip}` : '',
      e.threat_type ? `Type: ${e.threat_type.replace(/_/g, ' ')}` : '',
      ...(e.mitre_tags?.map(t => `MITRE: ${t}`) || [])
    ].filter(Boolean),
    isCrossLayer: e.is_correlation,
    rawData: e
  }
}

// ─── Simulation Scenario (static metadata, kept in config) ───────────────────
export interface SimulationScenario {
  id: number
  title: string
  description: string
  complexity: 'Low' | 'Medium' | 'High'
  duration: string
  events: { time: number; log: string }[]
}
