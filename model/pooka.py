import sys
sys.path.append(".") 
from model.predict import predict
print(predict({
    "src_ip": "192.168.1.45", "dst_ip": "10.0.0.5",
    "dst_port": 443, "bytes_out": 320, "status_code": 401,
    "endpoint": "/api/login", "failed_logins_1min": 312,
    "unique_dst_ips_5min": 1, "connection_interval_std": 2.1
}))