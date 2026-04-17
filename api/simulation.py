import asyncio
import random
from typing import List, Callable, Awaitable
from datetime import datetime
from .schemas import Scenario

class SimulationManager:
    def __init__(self):
        self.scenarios = [
            Scenario(
                id="scenario-1",
                name="Brute Force + Lateral Movement",
                complexity="High",
                duration="~2 min",
                description="Replay a multi-stage attack starting with external brute force and ending in internal network compromise."
            ),
            Scenario(
                id="scenario-2",
                name="C2 Beacon + Exfiltration",
                complexity="Medium",
                duration="~3 min",
                description="Simulate a compromised workstation communicating with an external Command & Control server."
            ),
            Scenario(
                id="scenario-3",
                name="Insider Threat Simulation",
                complexity="High",
                duration="~4 min",
                description="Trace an authorized user performing unauthorized data collection and exfiltration."
            )
        ]
        self.active_simulations = {}

    def get_scenarios(self) -> List[Scenario]:
        return self.scenarios

    async def run_scenario(self, scenario_id: str, log_callback: Callable[[str], Awaitable[None]]):
        if scenario_id == "scenario-1":
            await self._run_brute_force_scenario(log_callback)
        elif scenario_id == "scenario-2":
            await self._run_c2_scenario(log_callback)
        else:
            await log_callback("Starting generic simulation...")
            await asyncio.sleep(2)
            await log_callback("Simulation complete.")

    async def _run_brute_force_scenario(self, log_callback):
        logs = [
            "[*] Initializing simulation: Brute Force + Lateral Movement",
            "[+] Seeding events to App Layer: /api/login",
            "[!] Alert: High frequency of 401 Unauthorized from 192.168.1.45",
            "[*] Correlating signals...",
            "[+] Detection: Credential Stuffing pattern matched (Confidence: 92%)",
            "[*] Advancing simulation to Stage 2: Internal Scanning",
            "[!] Alert: 192.168.1.45 probing port 445 on 10.0.4.12",
            "[!] Alert: 192.168.1.45 probing port 22 on 10.0.4.15",
            "[*] Escalating incident: Severity CRITICAL",
            "[+] Lateral movement confirmed: 7 internal hosts reached",
            "[*] Simulation Complete. 3 threats detected. Detection latency: 4.2s avg."
        ]
        for log in logs:
            await log_callback(log)
            await asyncio.sleep(random.uniform(0.5, 1.5))

    async def _run_c2_scenario(self, log_callback):
        logs = [
            "[*] Initializing simulation: C2 Beaconing",
            "[+] Monitoring outbound traffic on port 443",
            "[!] Anomalous periodic connection detected to 45.33.12.11",
            "[*] Jitter analysis: 1.2s variation detected (Pattern: Beaconing)",
            "[+] Intelligence Match: Known Cobalt Strike C2 Infrastructure",
            "[*] Stage 2: Data Staging",
            "[!] File access spike on host FS-01: 4.2GB read by user SVC_DB",
            "[*] Stage 3: Exfiltration initiation",
            "[!] Alert: Data Exfiltration detected — 1.1GB sent to 45.33.12.11",
            "[*] Simulation Complete. 4 threats detected."
        ]
        for log in logs:
            await log_callback(log)
            await asyncio.sleep(random.uniform(0.5, 2.0))

simulation_manager = SimulationManager()
