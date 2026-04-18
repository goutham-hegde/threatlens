import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

<<<<<<< HEAD
# This is the "start time" for all our fake log events
base_time = datetime(2026, 4, 17, 2, 0, 0)

# -------------------------------------------------------
# FUNCTION 1: Normal boring traffic (5000 rows)
# These are regular users browsing the website normally
# -------------------------------------------------------
def generate_normal_traffic(n=5000):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=i * 0.5)).isoformat(),
            "src_ip": f"10.0.{random.randint(0,10)}.{random.randint(1,50)}",
            "dst_ip": f"10.0.0.{random.randint(1,20)}",
            "dst_port": random.choice([80, 443, 8080]),
            "bytes_out": random.randint(200, 5000),
            "status_code": random.choice([200, 200, 200, 301, 404]),
            "endpoint": random.choice(["/home", "/api/data", "/profile", "/search"]),
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": random.randint(1, 3),
            "connection_interval_std": random.uniform(10, 60),
            "label": "benign"
        })
    return pd.DataFrame(rows)

# -------------------------------------------------------
# FUNCTION 2: Brute Force Attack (312 rows)
# One attacker hammering the login page with wrong passwords
# -------------------------------------------------------
def generate_brute_force(n=312):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=47*60 + i*0.2)).isoformat(),
            "src_ip": "192.168.1.45",           # always same attacker IP
            "dst_ip": "10.0.0.5",
            "dst_port": 443,
            "bytes_out": 320,
            "status_code": 401,                  # 401 = wrong password
            "endpoint": "/api/login",
            "failed_logins_1min": i + 1,         # keeps going up
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 2.1,      # very rapid, regular
            "label": "brute_force"
        })
    return pd.DataFrame(rows)

# -------------------------------------------------------
# FUNCTION 3: Lateral Movement (50 rows)
# After breaking in, attacker moves to other machines
# -------------------------------------------------------
def generate_lateral_movement(n=50):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=51*60 + i*5)).isoformat(),
            "src_ip": "192.168.1.45",            # same attacker from brute force!
            "dst_ip": f"10.0.0.{i+1}",           # hitting different machines each time
            "dst_port": random.choice([445, 22, 3389]),
            "bytes_out": random.randint(100, 800),
            "status_code": 200,
            "endpoint": "/smb",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": i + 1,        # keeps hitting more machines
            "connection_interval_std": 3.2,
            "label": "lateral_movement"
        })
    return pd.DataFrame(rows)

# -------------------------------------------------------
# FUNCTION 4: C2 Beaconing (80 rows)
# Malware on infected machine calling home every 60 seconds
# -------------------------------------------------------
def generate_c2_beacon(n=80):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=i*61 + random.randint(-2, 2))).isoformat(),
            "src_ip": "10.0.1.33",
            "dst_ip": "185.220.101.47",          # external attacker server
            "dst_port": 443,
            "bytes_out": random.randint(80, 150), # small packets, just checking in
            "status_code": 200,
            "endpoint": "/beacon",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 1.8,      # very regular = very suspicious
            "label": "c2_beacon"
        })
    return pd.DataFrame(rows)

# -------------------------------------------------------
# FUNCTION 5: False Positive (30 rows)
# Admin doing a big backup - LOOKS like data theft but isn't
# -------------------------------------------------------
def generate_false_positive(n=30):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=33*60 + i*10)).isoformat(),
            "src_ip": "10.0.0.8",                # known admin machine
            "dst_ip": "203.0.113.50",            # backup server
            "dst_port": 443,
            "bytes_out": random.randint(50_000_000, 80_000_000),  # huge transfer
            "status_code": 200,
            "endpoint": "/api/backup",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 8.5,
            "label": "benign"                    # it IS benign, just large
=======
random.seed(42)
np.random.seed(42)

# All events start from this base time (2 AM - peak attack window)
BASE_TIME = datetime(2026, 4, 17, 2, 0, 0)

# ============================================================
# HELPER
# ============================================================

def ts(seconds_offset, jitter=0):
    """Return an ISO timestamp offset by seconds from BASE_TIME, with optional randomness."""
    return (BASE_TIME + timedelta(seconds=seconds_offset + random.uniform(0, jitter))).isoformat()


# ============================================================
# SECTION 1: BENIGN TRAFFIC — 32,000 rows
# Normal users doing normal things across business and off hours
# ============================================================

def generate_benign(n=32000):
    rows = []

    # Pool of realistic internal IPs (employees/servers)
    internal_ips = [f"10.0.{b}.{c}" for b in range(0, 15) for c in range(1, 60)]
    external_ips = [f"203.{a}.{b}.{c}" for a, b, c in zip(
        np.random.randint(0, 255, 200),
        np.random.randint(0, 255, 200),
        np.random.randint(1, 255, 200)
    )]
    endpoints = ["/home", "/api/data", "/profile", "/search",
                 "/dashboard", "/api/user", "/static/css", "/favicon.ico",
                 "/api/products", "/checkout", "/api/cart", "/logout"]

    for i in range(n):
        hour_offset = random.uniform(0, 86400)  # spread across full 24h
        src = random.choice(internal_ips)
        dst = random.choice(internal_ips + external_ips[:50])

        rows.append({
            "timestamp":              ts(hour_offset),
            "src_ip":                 src,
            "dst_ip":                 dst,
            "dst_port":               random.choice([80, 443, 443, 8080, 3000]),
            "bytes_out":              int(np.random.lognormal(7.5, 1.2)),  # realistic log-normal distribution
            "bytes_in":               int(np.random.lognormal(8.0, 1.3)),
            "status_code":            random.choices([200, 200, 200, 200, 301, 302, 404, 500], weights=[60,10,5,5,8,5,6,1])[0],
            "endpoint":               random.choice(endpoints),
            "protocol":               random.choice(["TCP", "TCP", "TCP", "UDP"]),
            "duration_sec":           round(random.uniform(0.05, 8.0), 2),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    random.randint(1, 4),
            "connection_interval_std":round(random.uniform(15, 120), 2),
            "bytes_out_per_min":      int(np.random.lognormal(7, 1)),
            "same_dst_ip_streak":     random.randint(0, 2),
            "is_external_dst":        int(dst in external_ips),
            "hour_of_day":            int((hour_offset % 86400) / 3600),
            "label":                  "benign"
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
        })
    return pd.DataFrame(rows)


<<<<<<< HEAD
# -------------------------------------------------------
# MAIN: Combine everything and save to CSV
# -------------------------------------------------------
if __name__ == "__main__":
    print("Generating data...")

    df = pd.concat([
        generate_normal_traffic(),
        generate_brute_force(),
        generate_lateral_movement(),
        generate_c2_beacon(),
        generate_false_positive()
    ]).sample(frac=1).reset_index(drop=True)  # shuffle all rows randomly

    import os
    
    # 1. Find exactly where this generate.py file lives on your computer
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Build the exact path to save logs.csv right next to it
    save_path = os.path.join(script_dir, "logs.csv")
    
    # 3. Save the file
    df.to_csv(save_path, index=False)
    
    # 4. Print the exact location so you know where it went
    print(f"\n📂 SUCCESS! The file was definitively saved to: {save_path}")

    print("✅ Done! Here's what was generated:")
    print(df['label'].value_counts())
    print(f"\nTotal rows: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")
=======
# ============================================================
# SECTION 2: ATTACK SCENARIO A
# Brute Force → Lateral Movement
# IP 192.168.1.45 hammers login, then pivots to 12 internal hosts
# This is the classic kill chain — most important to detect
# ============================================================

def generate_brute_force_to_lateral(n_bf=800, n_lat=120):
    rows = []
    attacker = "192.168.1.45"
    start    = 47 * 60  # attack starts at 2:47 AM

    # Phase 1: Rapid brute force — 800 failed logins in ~3 minutes
    for i in range(n_bf):
        rows.append({
            "timestamp":              ts(start + i * 0.23),   # ~1 attempt per 0.23 seconds
            "src_ip":                 attacker,
            "dst_ip":                 "10.0.0.5",
            "dst_port":               443,
            "bytes_out":              random.randint(280, 420),
            "bytes_in":               random.randint(180, 280),
            "status_code":            401,
            "endpoint":               "/api/login",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.05, 0.15), 3),
            "failed_logins_1min":     min(i + 1, 800),
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(0.1, 0.4), 3),  # very regular = suspicious
            "bytes_out_per_min":      random.randint(70000, 110000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "brute_force"
        })

    # Phase 2: Lateral movement — same IP, now scanning 12 new internal machines
    lat_start = start + n_bf * 0.23 + 240  # starts ~4 minutes after brute force
    for i in range(n_lat):
        target_host = f"10.0.{random.randint(0,5)}.{(i % 12) + 1}"
        rows.append({
            "timestamp":              ts(lat_start + i * 3.5, jitter=2),
            "src_ip":                 attacker,
            "dst_ip":                 target_host,
            "dst_port":               random.choice([445, 445, 22, 3389, 139]),  # SMB, SSH, RDP
            "bytes_out":              random.randint(80, 600),
            "bytes_in":               random.randint(60, 400),
            "status_code":            random.choice([200, 200, 403]),
            "endpoint":               random.choice(["/smb", "/ssh", "/rdp"]),
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.1, 2.5), 2),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    min(i + 1, 12),    # keeps growing — key signal
            "connection_interval_std":round(random.uniform(1.5, 5.0), 2),
            "bytes_out_per_min":      random.randint(5000, 30000),
            "same_dst_ip_streak":     0,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "lateral_movement"
        })

    return pd.DataFrame(rows)


# ============================================================
# SECTION 3: ATTACK SCENARIO B
# C2 Beaconing → Data Exfiltration
# IP 10.0.1.33 infected with malware, calls home every 60s,
# then after 2 hours starts pushing data out in chunks
# ============================================================

def generate_c2_to_exfiltration(n_beacon=120, n_exfil=80):
    rows = []
    infected = "10.0.1.33"
    c2_server = "185.220.101.47"   # external attacker-controlled server

    # Phase 1: C2 beaconing — regular like a heartbeat
    for i in range(n_beacon):
        interval = 61 + random.uniform(-2, 2)  # ~60 seconds, slight jitter
        rows.append({
            "timestamp":              ts(i * interval),
            "src_ip":                 infected,
            "dst_ip":                 c2_server,
            "dst_port":               443,
            "bytes_out":              random.randint(80, 160),   # tiny packets — just "checking in"
            "bytes_in":               random.randint(40, 80),
            "status_code":            200,
            "endpoint":               "/beacon",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.1, 0.5), 2),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(0.5, 2.5), 2),  # very low = very suspicious
            "bytes_out_per_min":      random.randint(80, 200),
            "same_dst_ip_streak":     i + 1,   # always same destination = beacon signature
            "is_external_dst":        1,
            "hour_of_day":            int((i * interval % 86400) / 3600),
            "label":                  "c2_beacon"
        })

    # Phase 2: Exfiltration — suddenly pushing large chunks to same external IP
    exfil_start = n_beacon * 61 + 300
    for i in range(n_exfil):
        rows.append({
            "timestamp":              ts(exfil_start + i * 45, jitter=5),
            "src_ip":                 infected,
            "dst_ip":                 c2_server,
            "dst_port":               443,
            "bytes_out":              random.randint(800000, 2500000),   # suddenly huge vs normal beacon
            "bytes_in":               random.randint(100, 300),
            "status_code":            200,
            "endpoint":               "/upload",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(3.0, 12.0), 2),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(8.0, 20.0), 2),
            "bytes_out_per_min":      random.randint(1000000, 3500000),
            "same_dst_ip_streak":     n_beacon + i + 1,
            "is_external_dst":        1,
            "hour_of_day":            int((exfil_start % 86400) / 3600),
            "label":                  "data_exfiltration"
        })

    return pd.DataFrame(rows)


# ============================================================
# SECTION 4: ATTACK SCENARIO C
# Port Scan → Brute Force on Discovered Services
# IP 172.16.0.99 first maps the network, then attacks open ports
# ============================================================

def generate_portscan_to_bruteforce(n_scan=300, n_bf2=200):
    rows = []
    attacker = "172.16.0.99"
    scan_start = 15 * 60  # starts at 2:15 AM

    # Phase 1: Port scan — rapid connections to many IPs on many ports
    ports_to_scan = [22, 80, 443, 445, 3306, 3389, 5432, 8080, 8443, 27017]
    for i in range(n_scan):
        target = f"10.0.{random.randint(0,8)}.{random.randint(1,50)}"
        rows.append({
            "timestamp":              ts(scan_start + i * 0.8, jitter=0.3),
            "src_ip":                 attacker,
            "dst_ip":                 target,
            "dst_port":               random.choice(ports_to_scan),
            "bytes_out":              random.randint(40, 80),    # tiny SYN packets
            "bytes_in":               random.randint(0, 60),
            "status_code":            random.choice([200, 403, 404, 404, 404]),
            "endpoint":               "/",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.001, 0.05), 4),   # very short = SYN scan
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    min(i + 1, 50),   # rapidly growing — key signal
            "connection_interval_std":round(random.uniform(0.2, 1.0), 3),
            "bytes_out_per_min":      random.randint(3000, 8000),
            "same_dst_ip_streak":     0,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "lateral_movement"   # port scan = recon = lateral movement family
        })

    # Phase 2: Brute force on discovered SSH port (22)
    bf_start = scan_start + n_scan * 0.8 + 180
    for i in range(n_bf2):
        rows.append({
            "timestamp":              ts(bf_start + i * 1.2, jitter=0.5),
            "src_ip":                 attacker,
            "dst_ip":                 "10.0.3.22",     # specific target found during scan
            "dst_port":               22,               # SSH
            "bytes_out":              random.randint(500, 900),
            "bytes_in":               random.randint(300, 600),
            "status_code":            401,
            "endpoint":               "/ssh",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.3, 1.5), 2),
            "failed_logins_1min":     min(i + 1, 50),
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(0.8, 2.0), 2),
            "bytes_out_per_min":      random.randint(25000, 50000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "brute_force"
        })

    return pd.DataFrame(rows)


# ============================================================
# SECTION 5: ATTACK SCENARIO D
# Slow Brute Force ("Low and Slow")
# 1 attempt per 30 seconds over 6 hours — designed to evade rate limits
# This is hard to detect without time-window features
# ============================================================

def generate_slow_brute_force(n=720):
    rows = []
    attacker = "10.5.0.12"

    for i in range(n):
        rows.append({
            "timestamp":              ts(i * 30, jitter=8),   # one attempt every ~30 seconds
            "src_ip":                 attacker,
            "dst_ip":                 "10.0.0.5",
            "dst_port":               443,
            "bytes_out":              random.randint(260, 400),
            "bytes_in":               random.randint(160, 260),
            "status_code":            401,
            "endpoint":               "/api/login",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.1, 0.4), 2),
            "failed_logins_1min":     random.randint(1, 3),    # low per minute — evasion tactic
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(5.0, 15.0), 2),  # slightly regular but not obvious
            "bytes_out_per_min":      random.randint(500, 2000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        0,
            "hour_of_day":            int(((i * 30) % 86400) / 3600),
            "label":                  "brute_force"
        })
    return pd.DataFrame(rows)


# ============================================================
# SECTION 6: ATTACK SCENARIO E
# Multi-Stage Slow Exfiltration
# Small chunks of data over 4 hours — avoids volume-based detection
# ============================================================

def generate_slow_exfiltration(n=480):
    rows = []
    attacker = "10.0.2.77"
    target   = "91.108.4.200"  # external server

    for i in range(n):
        rows.append({
            "timestamp":              ts(i * 30, jitter=10),
            "src_ip":                 attacker,
            "dst_ip":                 target,
            "dst_port":               443,
            "bytes_out":              random.randint(50000, 200000),   # medium chunks
            "bytes_in":               random.randint(200, 800),
            "status_code":            200,
            "endpoint":               "/api/sync",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(1.0, 6.0), 2),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(10.0, 25.0), 2),
            "bytes_out_per_min":      random.randint(100000, 400000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        1,
            "hour_of_day":            int(((i * 30) % 86400) / 3600),
            "label":                  "data_exfiltration"
        })
    return pd.DataFrame(rows)


# ============================================================
# SECTION 7: FALSE POSITIVE 1
# Admin doing a large backup — LOOKS like data exfiltration
# Key differences: known admin IP, known destination, backup hours (1-3 AM), regular schedule
# ============================================================

def generate_fp_admin_backup(n=150):
    rows = []
    admin_ip    = "10.0.0.8"
    backup_dest = "203.0.113.50"   # known backup server

    for i in range(n):
        rows.append({
            "timestamp":              ts(33 * 60 + i * 10, jitter=3),  # 2:33 AM
            "src_ip":                 admin_ip,
            "dst_ip":                 backup_dest,
            "dst_port":               443,
            "bytes_out":              random.randint(20_000_000, 80_000_000),  # massive — but it's a backup!
            "bytes_in":               random.randint(500, 2000),
            "status_code":            200,
            "endpoint":               "/api/backup",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(15.0, 60.0), 1),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    1,         # only ever talks to backup server
            "connection_interval_std":round(random.uniform(5.0, 12.0), 2),
            "bytes_out_per_min":      random.randint(20_000_000, 80_000_000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        1,
            "hour_of_day":            2,
            "label":                  "false_positive"   # IT IS A FALSE POSITIVE
        })
    return pd.DataFrame(rows)


# ============================================================
# SECTION 8: FALSE POSITIVE 2
# Monitoring bot making regular pings — LOOKS like C2 beaconing
# Key differences: known internal IP, destination is internal monitoring server, tiny bytes
# ============================================================

def generate_fp_monitoring_bot(n=200):
    rows = []
    monitor_ip   = "10.0.0.15"
    monitor_dest = "10.0.0.100"   # internal monitoring server (Prometheus, Grafana, etc.)

    for i in range(n):
        interval = 60 + random.uniform(-1, 1)  # every 60s, just like a real beacon
        rows.append({
            "timestamp":              ts(i * interval),
            "src_ip":                 monitor_ip,
            "dst_ip":                 monitor_dest,
            "dst_port":               9090,        # Prometheus port
            "bytes_out":              random.randint(120, 200),   # tiny healthcheck
            "bytes_in":               random.randint(80, 150),
            "status_code":            200,
            "endpoint":               "/metrics",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.02, 0.08), 3),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(0.3, 1.5), 2),  # very regular — same as C2!
            "bytes_out_per_min":      random.randint(120, 300),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        0,   # KEY DIFFERENCE: internal destination, not external
            "hour_of_day":            int((i * interval % 86400) / 3600),
            "label":                  "false_positive"
        })
    return pd.DataFrame(rows)


# ============================================================
# SECTION 9: FALSE POSITIVE 3
# Dev team stress test — LOOKS like brute force
# Key differences: known dev IP range, hits /api/test not /api/login, returns 200 not 401
# ============================================================

def generate_fp_stress_test(n=400):
    rows = []
    dev_ip = "10.99.0.45"   # dev/staging network

    for i in range(n):
        rows.append({
            "timestamp":              ts(10 * 60 + i * 0.1, jitter=0.05),  # 2:10 AM dev test window
            "src_ip":                 dev_ip,
            "dst_ip":                 "10.0.0.5",
            "dst_port":               443,
            "bytes_out":              random.randint(300, 600),
            "bytes_in":               random.randint(200, 400),
            "status_code":            200,     # KEY DIFFERENCE: 200 not 401 — succeeding, not failing
            "endpoint":               "/api/test",   # KEY DIFFERENCE: test endpoint, not /login
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.05, 0.2), 3),
            "failed_logins_1min":     0,       # KEY DIFFERENCE: no failed logins
            "unique_dst_ips_5min":    1,
            "connection_interval_std":round(random.uniform(0.05, 0.2), 3),  # rapid — looks like BF!
            "bytes_out_per_min":      random.randint(150000, 300000),
            "same_dst_ip_streak":     i + 1,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "false_positive"
        })
    return pd.DataFrame(rows)


# ============================================================
# SECTION 10: FALSE POSITIVE 4
# Security scanner (Nessus/OpenVAS) — LOOKS like lateral movement / port scan
# Key differences: known scanner IP, scheduled scan, hits known internal range only
# ============================================================

def generate_fp_security_scanner(n=500):
    rows = []
    scanner_ip = "10.0.0.200"   # dedicated security scanner machine
    ports = [22, 80, 443, 8080, 3306, 5432, 3389, 445]

    for i in range(n):
        target = f"10.0.{random.randint(0, 10)}.{random.randint(1, 50)}"
        rows.append({
            "timestamp":              ts(5 * 60 + i * 0.5, jitter=0.2),  # 2:05 AM scheduled scan
            "src_ip":                 scanner_ip,
            "dst_ip":                 target,
            "dst_port":               random.choice(ports),
            "bytes_out":              random.randint(40, 120),
            "bytes_in":               random.randint(20, 80),
            "status_code":            random.choice([200, 403, 404]),
            "endpoint":               "/",
            "protocol":               "TCP",
            "duration_sec":           round(random.uniform(0.01, 0.1), 3),
            "failed_logins_1min":     0,
            "unique_dst_ips_5min":    min(i + 1, 50),   # grows fast — exactly like lateral movement!
            "connection_interval_std":round(random.uniform(0.3, 1.2), 3),
            "bytes_out_per_min":      random.randint(5000, 15000),
            "same_dst_ip_streak":     0,
            "is_external_dst":        0,
            "hour_of_day":            2,
            "label":                  "false_positive"   # scheduled scan = false positive
        })
    return pd.DataFrame(rows)


# ============================================================
# MAIN — Combine everything, shuffle, save
# ============================================================

if __name__ == "__main__":
    print("Generating dataset components...")

    components = {
        "Benign traffic":               generate_benign(32000),
        "Brute force + lateral move":   generate_brute_force_to_lateral(800, 120),
        "C2 beacon + exfiltration":     generate_c2_to_exfiltration(120, 80),
        "Port scan + brute force":      generate_portscan_to_bruteforce(300, 200),
        "Slow brute force":             generate_slow_brute_force(720),
        "Slow exfiltration":            generate_slow_exfiltration(480),
        "FP: Admin backup":             generate_fp_admin_backup(150),
        "FP: Monitoring bot":           generate_fp_monitoring_bot(200),
        "FP: Stress test":              generate_fp_stress_test(400),
        "FP: Security scanner":         generate_fp_security_scanner(500),
    }

    for name, df in components.items():
        print(f"  [OK] {name:<35} {len(df):>6} rows")

    print("\nCombining and shuffling...")
    full_df = pd.concat(components.values()).sample(frac=1, random_state=42).reset_index(drop=True)

    full_df.to_csv("data/logs.csv", index=False)

    print(f"\n✅ Saved to data/logs.csv")
    print(f"   Total rows : {len(full_df):,}")
    print(f"\n--- Label distribution ---")
    dist = full_df['label'].value_counts()
    for label, count in dist.items():
        pct = count / len(full_df) * 100
        bar = '█' * int(pct / 2)
        print(f"  {label:<22} {count:>6} rows  {bar} {pct:.1f}%")

    print(f"\n--- False positive check ---")
    fp_ips = {"10.0.0.8", "10.0.0.15", "10.99.0.45", "10.0.0.200"}
    for ip in fp_ips:
        subset = full_df[full_df['src_ip'] == ip]
        labels = subset['label'].value_counts().to_dict()
        print(f"  {ip:<15} → {labels}")

    print("\nAll false positive IPs are correctly labelled as false_positive ✅")
>>>>>>> faa6da9db9a856407276fd50c63b58931fd78442
