from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid, time, asyncio, pandas as pd
from datetime import datetime
import sys; sys.path.append("..")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# In-memory store
alerts = []
incidents = []

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

@app.post("/ingest")
def ingest(event: LogEvent):
    from model.predict import predict
    result = predict(event.dict())

    alert = {
        "id": f"evt_{uuid.uuid4().hex[:6]}",
        "timestamp": event.timestamp or datetime.now().isoformat(),
        "src_ip": event.src_ip,
        "dst_ip": event.dst_ip,
        "layer": event.layer,
        **result
    }

    if result["threat_type"] != "benign" or result["is_false_positive"]:
        alerts.insert(0, alert)
        correlate(alert)

    return alert

@app.get("/alerts")
def get_alerts(limit: int = 20):
    return alerts[:limit]

@app.get("/incidents")
def get_incidents():
    return incidents

def correlate(new_alert):
    # Group alerts by src_ip — if 2+ layers fire within 5 min, create incident
    same_ip = [a for a in alerts if a["src_ip"] == new_alert["src_ip"]]
    layers_hit = list(set(a["layer"] for a in same_ip))

    if len(layers_hit) >= 2:
        existing = next((i for i in incidents if i["src_ip"] == new_alert["src_ip"]), None)
        if not existing:
            incidents.insert(0, {
                "id": f"inc_{uuid.uuid4().hex[:6]}",
                "src_ip": new_alert["src_ip"],
                "severity": "critical",
                "layers": layers_hit,
                "alert_count": len(same_ip),
                "first_seen": same_ip[-1]["timestamp"],
                "last_seen": same_ip[0]["timestamp"],
                "threat_types": list(set(a["threat_type"] for a in same_ip)),
                "summary": f"Cross-layer incident: {' + '.join(layers_hit)} signals correlated for {new_alert['src_ip']}"
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
    for _, row in df.iterrows():
        ingest(LogEvent(**row.to_dict()))
        await asyncio.sleep(0.3)

@app.get("/stats")
def get_stats():
    from collections import Counter
    types = Counter(a["threat_type"] for a in alerts)
    sevs = Counter(a["severity"] for a in alerts)
    return {
        "total_alerts": len(alerts),
        "active_incidents": len(incidents),
        "false_positives": sum(1 for a in alerts if a["is_false_positive"]),
        "avg_confidence": round(sum(a["confidence"] for a in alerts) / max(len(alerts),1), 3),
        "threat_breakdown": dict(types),
        "severity_breakdown": dict(sevs)
    }