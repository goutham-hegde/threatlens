import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

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
        })
    return pd.DataFrame(rows)


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