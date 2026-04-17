from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime
from typing import List

from .schemas import (
    AnalyticsStats, AlertBrief, AlertDetail, IncidentEvent, 
    ThreatDistribution, SeverityBreakdown, Scenario
)
from .mock_data import (
    ALERTS_INITIAL, ALERT_DETAILS, TIMELINE_EVENTS, 
    ANALYTICS, THREAT_DISTRIBUTION, SEVERITY_BREAKDOWN,
    BASE_TIME
)
from .simulation import simulation_manager

app = FastAPI(title="ThreatLens API")

# Configure CORS for the hackathon (allow all origins/methods/headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/overview")
async def get_overview():
    return {
        "stats": ANALYTICS,
        "initial_alerts": ALERTS_INITIAL
    }

@app.get("/analytics")
async def get_analytics():
    return {
        "distribution": THREAT_DISTRIBUTION,
        "severity": SEVERITY_BREAKDOWN
    }

@app.get("/timeline")
async def get_timeline() -> List[IncidentEvent]:
    return TIMELINE_EVENTS

@app.get("/alerts/{alert_id}")
async def get_alert_detail(alert_id: str) -> AlertDetail:
    if alert_id not in ALERT_DETAILS:
        raise HTTPException(status_code=404, detail="Alert not found")
    return ALERT_DETAILS[alert_id]

@app.get("/scenarios")
async def get_scenarios() -> List[Scenario]:
    return simulation_manager.get_scenarios()

@app.post("/scenarios/{scenario_id}/launch")
async def launch_simulation(scenario_id: str):
    # This just validates the ID, the actual work happens via WebSocket
    return {"status": "ready", "scenario_id": scenario_id}

# Real-time WebSocket for Live Alert Stream
@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        # Initial batch
        for alert in ALERTS_INITIAL:
            await websocket.send_text(alert.json())
            await asyncio.sleep(0.1)
        
        # Continuous stream for demo
        count = len(ALERTS_INITIAL) + 1
        while True:
            await asyncio.sleep(3) # New alert every 3 seconds as requested
            new_alert = ALERTS_INITIAL[0].copy(update={
                "id": f"alert-{count}",
                "timestamp": datetime.now(),
                "title": "Suspected Credential Stuffing" if count % 2 == 0 else "Anomalous Network Traffic"
            })
            await websocket.send_text(new_alert.json())
            count += 1
    except WebSocketDisconnect:
        print("Alert stream disconnected")

# Real-time WebSocket for Simulation Logs
@app.websocket("/ws/simulation/{scenario_id}")
async def websocket_simulation(websocket: WebSocket, scenario_id: str):
    await websocket.accept()
    try:
        async def send_log(message: str):
            await websocket.send_json({"type": "log", "content": message, "timestamp": datetime.now().isoformat()})
        
        await simulation_manager.run_scenario(scenario_id, send_log)
    except WebSocketDisconnect:
        print(f"Simulation {scenario_id} disconnected")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
