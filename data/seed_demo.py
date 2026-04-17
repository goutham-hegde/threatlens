import requests, time, pandas as pd

df  = pd.read_csv("data/logs.csv")
API = "http://localhost:8000"

LAYER_MAP = {
    "brute_force":       "app",
    "lateral_movement":  "network",
    "c2_beacon":         "network",
    "data_exfiltration": "network",
    "benign":            "network"
}

requests.delete(f"{API}/reset")
print(f"Seeding {len(df)} events...\n")

for i, row in df.iterrows():
    payload = {
        "src_ip":                 str(row["src_ip"]),
        "dst_ip":                 str(row["dst_ip"]),
        "dst_port":               int(row["dst_port"]),
        "bytes_out":              int(row["bytes_out"]),
        "status_code":            int(row["status_code"]),
        "endpoint":               str(row["endpoint"]),
        "failed_logins_1min":     float(row["failed_logins_1min"]),
        "unique_dst_ips_5min":    float(row["unique_dst_ips_5min"]),
        "connection_interval_std":float(row["connection_interval_std"]),
        "timestamp":              str(row["timestamp"]),
        "layer":                  LAYER_MAP.get(str(row["label"]), "network")
    }
    try:
        requests.post(f"{API}/ingest", json=payload, timeout=2)
    except Exception as e:
        print(f"  ⚠ Row {i} failed: {e}")

    if i % 200 == 0:
        print(f"  {i}/{len(df)} seeded...")
    time.sleep(0.01)

print("\nDone. Stats:")
print(requests.get(f"{API}/stats").json())