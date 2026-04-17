import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

base_time = datetime(2026, 4, 17, 2, 0, 0)

def generate_normal_traffic(n=5000):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=i*0.5)).isoformat(),
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

def generate_brute_force(n=312):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=47*60 + i*0.2)).isoformat(),
            "src_ip": "192.168.1.45",
            "dst_ip": "10.0.0.5",
            "dst_port": 443,
            "bytes_out": 320,
            "status_code": 401,
            "endpoint": "/api/login",
            "failed_logins_1min": i+1,
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 2.1,
            "label": "brute_force"
        })
    return pd.DataFrame(rows)

def generate_lateral_movement(n=50):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=51*60 + i*5)).isoformat(),
            "src_ip": "192.168.1.45",
            "dst_ip": f"10.0.0.{i+1}",
            "dst_port": random.choice([445, 22, 3389]),
            "bytes_out": random.randint(100, 800),
            "status_code": 200,
            "endpoint": "/smb",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": i+1,
            "connection_interval_std": 3.2,
            "label": "lateral_movement"
        })
    return pd.DataFrame(rows)

def generate_c2_beacon(n=80):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=i*61 + random.randint(-2,2))).isoformat(),
            "src_ip": "10.0.1.33",
            "dst_ip": "185.220.101.47",  # external
            "dst_port": 443,
            "bytes_out": random.randint(80, 150),
            "status_code": 200,
            "endpoint": "/beacon",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 1.8,  # very regular
            "label": "c2_beacon"
        })
    return pd.DataFrame(rows)

def generate_false_positive(n=30):
    rows = []
    for i in range(n):
        rows.append({
            "timestamp": (base_time + timedelta(seconds=33*60 + i*10)).isoformat(),
            "src_ip": "10.0.0.8",  # known admin
            "dst_ip": "203.0.113.50",  # backup server
            "dst_port": 443,
            "bytes_out": random.randint(50_000_000, 80_000_000),  # 50-80MB chunks
            "status_code": 200,
            "endpoint": "/api/backup",
            "failed_logins_1min": 0,
            "unique_dst_ips_5min": 1,
            "connection_interval_std": 8.5,
            "label": "benign"  # IT IS benign
        })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    df = pd.concat([
        generate_normal_traffic(),
        generate_brute_force(),
        generate_lateral_movement(),
        generate_c2_beacon(),
        generate_false_positive()
    ]).sample(frac=1).reset_index(drop=True)
    df.to_csv("data/logs.csv", index=False)
    print(df['label'].value_counts())