import pickle
import pandas as pd

# Load saved model
model    = pickle.load(open("model/model.pkl",         "rb"))
le       = pickle.load(open("model/label_encoder.pkl", "rb"))
FEATURES = pickle.load(open("model/features.pkl",      "rb"))

def predict(event):
    row = pd.DataFrame([{f: event.get(f, 0) for f in FEATURES}])
    proba     = model.predict_proba(row)[0]
    pred_idx  = proba.argmax()
    label     = le.inverse_transform([pred_idx])[0]
    confidence= round(float(proba[pred_idx]), 3)
    return label, confidence, proba

# --- TEST 1: Should detect brute force ---
print("TEST 1: Brute Force Event")
label, conf, proba = predict({
    "dst_port": 443,
    "bytes_out": 320,
    "status_code": 401,
    "failed_logins_1min": 312,
    "unique_dst_ips_5min": 1,
    "connection_interval_std": 2.1
})
print(f"  Detected: {label} ({conf*100:.1f}% confidence)")
print(f"  {'✅ CORRECT' if label == 'brute_force' else '❌ WRONG'}\n")

# --- TEST 2: Should detect C2 beacon ---
print("TEST 2: C2 Beacon Event")
label, conf, proba = predict({
    "dst_port": 443,
    "bytes_out": 100,
    "status_code": 200,
    "failed_logins_1min": 0,
    "unique_dst_ips_5min": 1,
    "connection_interval_std": 1.8   # very regular = beacon
})
print(f"  Detected: {label} ({conf*100:.1f}% confidence)")
print(f"  {'✅ CORRECT' if label == 'c2_beacon' else '❌ WRONG'}\n")

# --- TEST 3: Should be benign ---
print("TEST 3: Normal Traffic")
label, conf, proba = predict({
    "dst_port": 80,
    "bytes_out": 1200,
    "status_code": 200,
    "failed_logins_1min": 0,
    "unique_dst_ips_5min": 2,
    "connection_interval_std": 35.0
})
print(f"  Detected: {label} ({conf*100:.1f}% confidence)")
print(f"  {'✅ CORRECT' if label == 'benign' else '❌ WRONG'}\n")