from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from pydantic import BaseModel
from typing import Optional
import uuid, time, asyncio, pandas as pd
=======
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid, time, asyncio, pandas as pd, json
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
from datetime import datetime
import sys
from model.predict import predict

<<<<<<< HEAD
app = FastAPI()
=======
app = FastAPI(title="ThreatLens ML API", version="2.0")
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# In-memory store
alerts = []
incidents = []

<<<<<<< HEAD
=======
# SSE subscribers — list of asyncio.Queue objects, one per connected client
_sse_subscribers: list[asyncio.Queue] = []

# ─── Models ──────────────────────────────────────────────────────────────────

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
class LogEvent(BaseModel):
    timestamp: Optional[str] = None
    src_ip: str
    dst_ip: str
    dst_port: int
    bytes_out: int
    status_code: int
    endpoint: str
    failed_logins_1min: float = 0
    unique_dst_ips_5min: float = 1
    connection_interval_std: float = 30
    layer: str = "network"

<<<<<<< HEAD
@app.post("/ingest")
def ingest(event: LogEvent):
    
=======
# ─── SSE broadcast helper ─────────────────────────────────────────────────────

async def _broadcast(event_type: str, data: dict):
    """Push an SSE event to every connected subscriber."""
    payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
    dead = []
    for q in _sse_subscribers:
        try:
            await q.put(payload)
        except Exception:
            dead.append(q)
    for q in dead:
        _sse_subscribers.remove(q)

# ─── Ingest ───────────────────────────────────────────────────────────────────

@app.post("/ingest")
async def ingest(event: LogEvent):
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    result = predict(event.dict())

    alert = {
        "id":        f"evt_{uuid.uuid4().hex[:6]}",
        "timestamp": event.timestamp or datetime.now().isoformat(),
        "src_ip":    event.src_ip,
        "dst_ip":    event.dst_ip,
        "endpoint":  event.endpoint,
        "layer":     event.layer,
        **result
    }

    if alert["threat_type"] != "benign" or alert["is_false_positive"]:
        alerts.insert(0, alert)
<<<<<<< HEAD
        correlate(alert)

    return alert

=======
        await correlate(alert)
        # Push to SSE subscribers immediately
        await _broadcast("alert", alert)

    return alert

# ─── Alerts ───────────────────────────────────────────────────────────────────

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
@app.get("/alerts")
def get_alerts(limit: int = 20):
    return alerts[:limit]

<<<<<<< HEAD
=======
@app.get("/alerts/{alert_id}")
def get_alert(alert_id: str):
    match = next((a for a in alerts if a["id"] == alert_id), None)
    return match or {"error": "not found"}

# ─── Incidents ────────────────────────────────────────────────────────────────

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
@app.get("/incidents")
def get_incidents():
    return incidents

<<<<<<< HEAD
def correlate(new_alert):
    # Group alerts by src_ip — if 2+ layers fire within 5 min, create incident
=======
# ─── Correlation ──────────────────────────────────────────────────────────────

async def correlate(new_alert):
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
    same_ip = [a for a in alerts if a["src_ip"] == new_alert["src_ip"]]
    layers_hit = list(set(a["layer"] for a in same_ip))

    if len(layers_hit) >= 2:
        existing = next((i for i in incidents if i["src_ip"] == new_alert["src_ip"]), None)
        if not existing:
<<<<<<< HEAD
            incidents.insert(0, {
=======
            incident = {
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
                "id": f"inc_{uuid.uuid4().hex[:6]}",
                "src_ip": new_alert["src_ip"],
                "severity": "critical",
                "layers": layers_hit,
                "alert_count": len(same_ip),
                "first_seen": same_ip[-1]["timestamp"],
                "last_seen": same_ip[0]["timestamp"],
                "threat_types": list(set(a["threat_type"] for a in same_ip)),
                "summary": f"Cross-layer incident: {' + '.join(layers_hit)} signals correlated for {new_alert['src_ip']}"
<<<<<<< HEAD
            })

@app.post("/simulate/{scenario_id}")
async def simulate(scenario_id: int):
    import pandas as pd
    df = pd.read_csv("data/logs.csv")

    if scenario_id == 1:
        subset = df[df['label'].isin(['brute_force', 'lateral_movement'])].head(50)
    elif scenario_id == 2:
        subset = df[df['label'].isin(['c2_beacon'])].head(40)
    else:
        subset = df[df['label'] == 'benign'].head(30)

    # Stream events in background
    asyncio.create_task(stream_events(subset))
    return {"status": "simulation started", "events": len(subset)}

async def stream_events(df):
    FIELDS = ["src_ip","dst_ip","dst_port","bytes_out","status_code",
              "endpoint","failed_logins_1min","unique_dst_ips_5min",
              "connection_interval_std","timestamp"]
    for _, row in df.iterrows():
        event_data = {f: row[f] for f in FIELDS if f in row}
        ingest(LogEvent(**event_data))
        await asyncio.sleep(0.3)
=======
            }
            incidents.insert(0, incident)
            await _broadcast("incident", incident)

# ─── Stats ────────────────────────────────────────────────────────────────────
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

@app.get("/stats")
def get_stats():
    from collections import Counter
    types = Counter(a["threat_type"] for a in alerts)
<<<<<<< HEAD
    sevs = Counter(a["severity"] for a in alerts)
    return {
        "total_alerts": len(alerts),
        "active_incidents": len(incidents),
        "false_positives": sum(1 for a in alerts if a["is_false_positive"]),
        "avg_confidence": round(sum(a["confidence"] for a in alerts) / max(len(alerts),1), 3),
        "threat_breakdown": dict(types),
        "severity_breakdown": dict(sevs)
    }
=======
    sevs  = Counter(a["severity"] for a in alerts)
    return {
        "total_alerts":      len(alerts),
        "active_incidents":  len(incidents),
        "false_positives":   sum(1 for a in alerts if a["is_false_positive"]),
        "avg_confidence":    round(sum(a["confidence"] for a in alerts) / max(len(alerts), 1), 3),
        "threat_breakdown":  dict(types),
        "severity_breakdown": dict(sevs)
    }

# ─── Timeline ────────────────────────────────────────────────────────────────

>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
@app.get("/timeline")
def get_timeline():
    sorted_alerts = sorted(alerts, key=lambda x: x["timestamp"])
    timeline = []
    for a in sorted_alerts:
        timeline.append({
            "timestamp":    a["timestamp"],
            "layer":        a["layer"].upper(),
            "severity":     a["severity"],
            "event":        a["reason"],
            "src_ip":       a["src_ip"],
            "threat_type":  a["threat_type"],
            "mitre_tags":   a["mitre_tags"],
            "is_correlation": False
        })
    for inc in incidents:
        timeline.append({
            "timestamp":  inc["last_seen"],
            "layer":      "SYSTEM",
            "severity":   "critical",
            "event":      f"CROSS-LAYER INCIDENT — {' + '.join(inc['layers'])} correlated for {inc['src_ip']}",
            "src_ip":     inc["src_ip"],
            "is_correlation": True
        })
    return sorted(timeline, key=lambda x: x["timestamp"])

<<<<<<< HEAD
@app.get("/alerts/{alert_id}")
def get_alert(alert_id: str):
    match = next((a for a in alerts if a["id"] == alert_id), None)
    return match or {"error": "not found"}
=======
# ─── Simulate ─────────────────────────────────────────────────────────────────

@app.post("/simulate/{scenario_id}")
async def simulate(scenario_id: int):
    df = pd.read_csv("data/logs.csv")

    if scenario_id == 1:
        subset = df[df['label'].isin(['brute_force', 'lateral_movement'])].head(50)
    elif scenario_id == 2:
        subset = df[df['label'].isin(['c2_beacon', 'data_exfiltration'])].head(40)
    else:
        subset = df[df['label'] == 'benign'].head(30)

    asyncio.create_task(stream_events(subset))
    return {"status": "simulation started", "events": len(subset)}

async def stream_events(df):
    FIELDS = ["src_ip", "dst_ip", "dst_port", "bytes_out", "status_code",
              "endpoint", "failed_logins_1min", "unique_dst_ips_5min",
              "connection_interval_std", "timestamp"]
    for _, row in df.iterrows():
        event_data = {f: row[f] for f in FIELDS if f in row}
        await ingest(LogEvent(**event_data))
        await asyncio.sleep(0.3)

# ─── SSE Stream ───────────────────────────────────────────────────────────────

@app.get("/stream")
async def sse_stream():
    """
    Server-Sent Events endpoint.
    Frontend can connect here for push-based real-time updates instead of polling.
    Usage: const es = new EventSource('http://localhost:8000/stream')
    """
    q: asyncio.Queue = asyncio.Queue()
    _sse_subscribers.append(q)

    async def event_generator():
        # Send a heartbeat comment every 15s to keep connection alive
        try:
            yield ": heartbeat\n\n"
            while True:
                try:
                    data = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield data
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if q in _sse_subscribers:
                _sse_subscribers.remove(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

# ─── Reset ────────────────────────────────────────────────────────────────────
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442

@app.delete("/reset")
def reset():
    alerts.clear()
    incidents.clear()
<<<<<<< HEAD
    return {"status": "cleared"}
=======
    return {"status": "cleared"}

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "alerts": len(alerts), "incidents": len(incidents)}
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
