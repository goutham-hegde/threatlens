import sys
import os
sys.path.append(os.getcwd())

from model.predict import predict

def test_fp():
    print("Testing False Positive Detection...")
    
    # scenario 1: Admin backup (known admin IP, high bytes_out)
    backup_event = {
        "src_ip": "10.0.0.8",
        "dst_ip": "203.0.113.50",
        "dst_port": 443,
        "bytes_out": 50_000_000,
        "bytes_in": 1000,
        "status_code": 200,
        "endpoint": "/api/backup",
        "is_external_dst": 1,
        "hour_of_day": 2
    }
    
    # scenario 2: Monitoring bot (internal destination, regular pings)
    bot_event = {
        "src_ip": "10.0.0.15",
        "dst_ip": "10.0.0.100",
        "dst_port": 9090,
        "bytes_out": 150,
        "bytes_in": 100,
        "status_code": 200,
        "endpoint": "/metrics",
        "protocol": "TCP",
        "duration_sec": 0.05,
        "connection_interval_std": 0.5,
        "is_external_dst": 0,
        "hour_of_day": 10
    }

    # scenario 3: Real Attack (Data Exfiltration - not from admin, external dest)
    attack_event = {
        "src_ip": "10.0.2.77",
        "dst_ip": "185.220.101.47",
        "dst_port": 443,
        "bytes_out": 2_000_000,
        "bytes_in": 200,
        "status_code": 200,
        "endpoint": "/upload",
        "is_external_dst": 1,
        "hour_of_day": 3,
        "bytes_out_per_min": 2_000_000,
        "same_dst_ip_streak": 50,
        "unique_dst_ips_5min": 1
    }

    scenarios = [
        ("Admin Backup", backup_event),
        ("Monitoring Bot", bot_event),
        ("Real Attack", attack_event)
    ]

    for name, event in scenarios:
        res = predict(event)
        print(f"\nScenario: {name}")
        print(f"  Detected Type: {res['threat_type']}")
        print(f"  Is False Positive Flag: {res['is_false_positive']}")
        print(f"  Confidence: {res['confidence']*100}%")
        print(f"  Reason: {res['reason']}")

if __name__ == "__main__":
    test_fp()
