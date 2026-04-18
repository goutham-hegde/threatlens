import pickle
import pandas as pd
import shap

model    = pickle.load(open("model/model.pkl",         "rb"))
le       = pickle.load(open("model/label_encoder.pkl", "rb"))
explainer= pickle.load(open("model/explainer.pkl",     "rb"))
FEATURES = pickle.load(open("model/features.pkl",      "rb"))

SEVERITY_MAP = {
    "brute_force":       "critical",
    "lateral_movement":  "critical",
    "c2_beacon":         "high",
    "data_exfiltration": "high",
    "false_positive":    "low",
    "benign":            "low"
}

MITRE_MAP = {
    "brute_force":       ["T1110"],
    "lateral_movement":  ["T1021"],
    "c2_beacon":         ["T1071"],
    "data_exfiltration": ["T1048"],
    "false_positive":    [],
    "benign":            []
}

KILL_CHAIN = {
    "brute_force":       {"stage": "Credential Access",  "stage_idx": 3, "next": "Lateral Movement"},
    "lateral_movement":  {"stage": "Lateral Movement",   "stage_idx": 5, "next": "Data Exfiltration"},
    "c2_beacon":         {"stage": "Command & Control",  "stage_idx": 6, "next": "Exfiltration"},
    "data_exfiltration": {"stage": "Exfiltration",       "stage_idx": 7, "next": "Impact"},
    "false_positive":    {"stage": "None (Reviewed)",    "stage_idx": 0, "next": "None"},
    "benign":            {"stage": "None",               "stage_idx": 0, "next": "None"}
}

KNOWN_ADMIN_IPS = {"10.0.0.8"}

PLAYBOOKS = {
    "brute_force": {
        "immediate": [
            "Block {src_ip} at perimeter firewall immediately",
            "Force password reset for all accounts that received auth requests",
            "Enable rate limiting on {endpoint}"
        ],
        "short_term": [
            "Pull full auth logs for past 24h on {endpoint}",
            "Check for any successful logins from {src_ip} before the block"
        ],
        "escalate_if": "Any successful auth followed by internal host connections"
    },
    "lateral_movement": {
        "immediate": [
            "Isolate {src_ip} from internal network segment",
            "Block SMB (445), RDP (3389), SSH (22) from {src_ip}"
        ],
        "short_term": [
            "Review connection logs on all internally contacted hosts",
            "Check for file access or registry changes on affected hosts"
        ],
        "escalate_if": "Any outbound data spike from internally contacted hosts"
    },
    "c2_beacon": {
        "immediate": [
            "Block outbound traffic to {dst_ip} at firewall",
            "Isolate the beaconing host from network"
        ],
        "short_term": [
            "Identify the process making connections on the affected host",
            "Check DNS logs for domain associated with {dst_ip}"
        ],
        "escalate_if": "Beacon interval changes or payload size increases"
    },
    "data_exfiltration": {
        "immediate": [
            "Block outbound traffic to {dst_ip}",
            "Identify which files or data were transferred"
        ],
        "short_term": [
            "Determine data classification of transferred content",
            "Begin breach notification assessment if PII involved"
        ],
        "escalate_if": "Transfer volume exceeds 1GB or destination IP changes"
    },
    "false_positive": {
        "immediate": ["No action required - flagged as safe noise"],
        "short_term": ["Review the pattern to ensure whitelist is still valid"],
        "escalate_if": "Source IP changes behavior to match other attack patterns"
    },
    "benign": {
        "immediate": ["No action required"],
        "short_term": ["Log reviewed and closed"],
        "escalate_if": "Pattern recurs outside expected maintenance window"
    }
}

REASONS = {
    "brute_force":       "failed_login_count was abnormally high from a single source IP",
    "lateral_movement":  "source IP contacted multiple internal hosts with no prior connection history",
    "c2_beacon":         "highly regular low-volume connections to external IP — consistent with beaconing",
    "data_exfiltration": "abnormally large outbound data transfer to external destination",
    "false_positive":    "behavior matches a known safe activity pattern (e.g. backup, scanner, stress test)",
    "benign":            "all signals within normal range"
}

def get_playbook(threat_type, context):
    p = PLAYBOOKS.get(threat_type, PLAYBOOKS["benign"])
    def fill(steps):
        return [s.format(**{k: context.get(k, "N/A") for k in ["src_ip", "dst_ip", "endpoint"]}) for s in steps]
    return {
        "immediate":   fill(p["immediate"]),
        "short_term":  fill(p["short_term"]),
        "escalate_if": p["escalate_if"]
    }

def predict(event: dict):
    row      = pd.DataFrame([{f: event.get(f, 0) for f in FEATURES}])
    proba    = model.predict_proba(row)[0]
    pred_idx = proba.argmax()
    label    = le.inverse_transform([pred_idx])[0]
    confidence = round(float(proba[pred_idx]), 3)

    # SHAP
    shap_vals = explainer.shap_values(row)
    
    # Handle different SHAP output formats (list of arrays, 3D array, or Explanation object)
    if isinstance(shap_vals, list):
        # List of arrays (one per class), each (n_samples, n_features)
        vals = shap_vals[pred_idx]
        top_shap = vals[0] if len(vals.shape) > 1 else vals
    elif hasattr(shap_vals, "values"):
        # shap.Explanation object
        exp_vals = shap_vals.values
        if len(exp_vals.shape) == 3: # (samples, features, classes)
            top_shap = exp_vals[0, :, pred_idx]
        else:
            top_shap = exp_vals[0]
    else:
        # Single numpy array
        if len(shap_vals.shape) == 3: # (samples, features, classes)
            top_shap = shap_vals[0, :, pred_idx]
        elif len(shap_vals.shape) == 2: # (samples, features)
            top_shap = shap_vals[0]
        else:
            top_shap = shap_vals

    top_shap = list(top_shap)

    # False positive detection
    # 1. Model predicted it directly
    is_fp = (label == "false_positive")
    
    # 2. Heuristic override for safety (can be removed if model is perfect)
    if not is_fp and event.get("src_ip") in KNOWN_ADMIN_IPS and event.get("bytes_out", 0) > 1_000_000:
        label      = "false_positive"
        is_fp      = True
        confidence = round(confidence * 0.9, 3) # slightly lower confidence for override

    return {
        "threat_type":   label,
        "severity":      SEVERITY_MAP.get(label, "low"),
        "confidence":    confidence,
        "mitre_tags":    MITRE_MAP.get(label, []),
        "kill_chain":    KILL_CHAIN.get(label, KILL_CHAIN["benign"]),
        "reason":        REASONS.get(label, "anomalous pattern detected"),
        "is_false_positive": is_fp,
        "shap_features": [
            {"name": f, "value": round(float(v), 3)}
            for f, v in zip(FEATURES, top_shap)
        ],
        "playbook": get_playbook(label, event)
    }