// ─── API Client — all calls to FastAPI backend ─────────────────────────────────

import type { BackendAlert, BackendIncident, Stats, BackendTimelineEvent } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers }
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

// ─── GET /alerts?limit=N ─────────────────────────────────────────────────────
export async function fetchAlerts(limit = 20): Promise<BackendAlert[]> {
  return apiFetch<BackendAlert[]>(`/alerts?limit=${limit}`)
}

// ─── GET /incidents ───────────────────────────────────────────────────────────
export async function fetchIncidents(): Promise<BackendIncident[]> {
  return apiFetch<BackendIncident[]>('/incidents')
}

// ─── GET /stats ───────────────────────────────────────────────────────────────
export async function fetchStats(): Promise<Stats> {
  return apiFetch<Stats>('/stats')
}

// ─── GET /timeline ────────────────────────────────────────────────────────────
export async function fetchTimeline(): Promise<BackendTimelineEvent[]> {
  return apiFetch<BackendTimelineEvent[]>('/timeline')
}

// ─── POST /simulate/:id ───────────────────────────────────────────────────────
export async function startSimulation(scenarioId: number): Promise<{ status: string; events: number }> {
  return apiFetch(`/simulate/${scenarioId}`, { method: 'POST' })
}

// ─── DELETE /reset ────────────────────────────────────────────────────────────
export async function resetData(): Promise<{ status: string }> {
  return apiFetch('/reset', { method: 'DELETE' })
}

// ─── GET /alerts/:id ─────────────────────────────────────────────────────────
export async function fetchAlertById(id: string): Promise<BackendAlert> {
  return apiFetch<BackendAlert>(`/alerts/${id}`)
}

// ─── Polling helper ───────────────────────────────────────────────────────────
// Returns a cleanup fn. Calls `cb` immediately, then every `intervalMs`.
export function startPolling(cb: () => void, intervalMs = 4000): () => void {
  cb()
  const id = setInterval(cb, intervalMs)
  return () => clearInterval(id)
}
