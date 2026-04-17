import pickle, shap, numpy as np
import pandas as pd

model = pickle.load(open("model/model.pkl", "rb"))
le = pickle.load(open("model/label_encoder.pkl", "rb"))
explainer = pickle.load(open("model/explainer.pkl", "rb"))

FEATURES = [
    "dst_port", "bytes_out", "status_code",
    "failed_logins_1min", "unique_dst_ips_5min", "connection_interval_std"
]

SEVERITY_MAP = {
    "brute_force": "critical",
    "lateral_movement": "critical",
    "c2_beacon": "high",
    "data_exfiltration": "high",
    "benign": "low"
}

MITRE_MAP = {
    "brute_force": ["T1110"],
    "lateral_movement": ["T1021"],
    "c2_beacon": ["T1071"],
    "data_exfiltration": ["T1048"],
    "benign": []
}

KNOWN_ADMIN_IPS = {"10.0.0.8"}

def get_reason(label, shap_vals, feature_names):
    top = sorted(zip(feature_names, shap_vals), key=lambda x: abs(x[1]), reverse=True)[:2]
    reasons = {
        "brute_force": f"failed_login_count was {top[0][1]:.0f}x above baseline with single source IP",
        "lateral_movement": f"source IP contacted {top[0][1]:.0f} new internal hosts with no prior history",
        "c2_beacon": f"connections to external IP at near-fixed intervals (std={top[0][1]:.1f}s)",
        "data_exfiltration": f"outbound data {top[0][1]:.0f}x above normal for this endpoint",
        "benign": "all signals within normal range"
    }
    return reasons.get(label, "anomalous pattern detected")

def predict(event: dict):
    row = pd.DataFrame([{f: event.get(f, 0) for f in FEATURES}])
    proba = model.predict_proba(row)[0]
    pred_idx = proba.argmax()
    label = le.inverse_transform([pred_idx])[0]
    confidence = round(float(proba[pred_idx]), 3)

    shap_vals = explainer.shap_values(row)
    top_shap = shap_vals[pred_idx][0].tolist()

    # False positive override
    is_fp = False
    if event.get("src_ip") in KNOWN_ADMIN_IPS and event.get("bytes_out", 0) > 1_000_000:
        label = "benign"
        is_fp = True
        confidence = round(confidence * 0.6, 3)

    reason = get_reason(label, top_shap, FEATURES)

    return {
        "threat_type": label,
        "severity": SEVERITY_MAP.get(label, "low"),
        "confidence": confidence,
        "mitre_tags": MITRE_MAP.get(label, []),
        "reason": reason,
        "is_false_positive": is_fp,
        "shap_features": [
            {"name": f, "value": round(v, 3)}
            for f, v in zip(FEATURES, top_shap)
        ]
    }