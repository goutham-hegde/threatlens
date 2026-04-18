"""
ThreatLens — Full Model Training Pipeline
==========================================
Trains a calibrated RandomForest to detect all 4 threat types + False Positives:
  brute_force | lateral_movement | c2_beacon | data_exfiltration | false_positive | benign

Key improvements over v1:
  • 10 features (added bytes_in, duration_sec, bytes_out_per_min,
    same_dst_ip_streak, is_external_dst, hour_of_day)
  • SMOTE oversampling so rare classes (c2_beacon: 120 rows) aren't ignored
  • CalibratedClassifierCV (Platt scaling) — makes predict_proba() truly
    reflect real-world confidence (e.g. 87% really means 87%)
  • Classification report per-class so you see F1 for each threat type
  • SHAP TreeExplainer stored for explainability panel
"""

import pandas as pd
import numpy as np
import pickle
import sys

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, brier_score_loss
)

import shap

# ─── Try SMOTE (optional but greatly improves minority-class recall) ──────────
try:
    from imblearn.over_sampling import SMOTE
    USE_SMOTE = True
except ImportError:
    USE_SMOTE = False
    print("[WARN] imbalanced-learn not found. Falling back to class_weight='balanced'.")

# ─── 1. LOAD DATA ─────────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 1 — Loading dataset")
print("=" * 60)

df = pd.read_csv("data/logs.csv", low_memory=False)
print(f"  Rows loaded   : {len(df):,}")
print(f"  Columns       : {list(df.columns)}")

# ─── 2. FEATURE SELECTION ─────────────────────────────────────────────────────
# These 10 features cover all 4 attack patterns:
#
#  dst_port                — known attack ports (22=SSH, 445=SMB, 3389=RDP)
#  bytes_out               — volume exfiltration signal
#  bytes_in                — C2 responses are often small
#  status_code             — 401 spikes = brute force
#  duration_sec            — C2 beacons have very consistent duration
#  failed_logins_1min      — direct brute-force counter
#  unique_dst_ips_5min     — lateral movement = many unique internal IPs
#  connection_interval_std — C2 beacon = near-zero std (very regular)
#  bytes_out_per_min       — exfiltration = sustained high rate
#  same_dst_ip_streak      — C2 = same external IP hit repeatedly
#  is_external_dst         — exfil/C2 always goes external
#  hour_of_day             — attacks cluster at off-hours

ALL_POSSIBLE = [
    "dst_port",
    "bytes_out",
    "bytes_in",
    "status_code",
    "duration_sec",
    "failed_logins_1min",
    "unique_dst_ips_5min",
    "connection_interval_std",
    "bytes_out_per_min",
    "same_dst_ip_streak",
    "is_external_dst",
    "hour_of_day",
]

# Use only columns that exist in the CSV
FEATURES = [f for f in ALL_POSSIBLE if f in df.columns]
print(f"\n  Features used : {FEATURES}")

# ─── 3. CLEAN & LABEL ─────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 2 — Cleaning & encoding labels")
print("=" * 60)

# Replace inf/-inf, fill NaN with column median
df = df.replace([np.inf, -np.inf], np.nan)
df[FEATURES] = df[FEATURES].fillna(df[FEATURES].median(numeric_only=True))

# Coerce all features to float (some columns may be mixed-type strings in CSV)
for c in FEATURES:
    df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0).astype(float)

le = LabelEncoder()
df["label_enc"] = le.fit_transform(df["label"])

print(f"\n  Label classes : {list(le.classes_)}")
print(f"\n  Label distribution (before oversampling):")
vc = df["label"].value_counts()
for lbl, cnt in vc.items():
    bar = "=" * int(cnt / vc.max() * 30)
    pct = cnt / len(df) * 100
    print(f"    {lbl:<22} {cnt:>6,}  {bar}  ({pct:.1f}%)")

# ─── 4. TRAIN / TEST SPLIT ────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 3 — Splitting data (80/20 stratified)")
print("=" * 60)

X = df[FEATURES].values.astype(float)
y = df["label_enc"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y   # keeps class ratios equal in both splits
)
print(f"  Train : {len(X_train):,} rows")
print(f"  Test  : {len(X_test):,} rows")

# ─── 5. SMOTE OVERSAMPLING ────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 4 — Oversampling minority classes with SMOTE")
print("=" * 60)

if USE_SMOTE:
    try:
        # k_neighbors must be < minority class count
        min_count = min(np.bincount(y_train))
        k = min(5, min_count - 1)
        print(f"  Smallest class size (train): {min_count} — using k_neighbors={k}")
        smote = SMOTE(random_state=42, k_neighbors=k)
        X_train, y_train = smote.fit_resample(X_train, y_train)
        print(f"  After SMOTE — Train size: {len(X_train):,}")
        unique, counts = np.unique(y_train, return_counts=True)
        for u, c in zip(unique, counts):
            print(f"    {le.classes_[u]:<22} {c:,}")
    except Exception as e:
        print(f"  [WARN] SMOTE failed ({e}). Proceeding without oversampling.")
else:
    print("  Skipping SMOTE (library not available).")

# ─── 6. TRAIN BASE RANDOM FOREST ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 5 — Training RandomForest (n_estimators=200)")
print("=" * 60)

base_rf = RandomForestClassifier(
    n_estimators=200,          # 200 trees = better than 100, still fast
    max_depth=None,            # let trees grow fully
    min_samples_leaf=2,        # slight regularisation to prevent overfitting
    class_weight="balanced",   # extra safety even after SMOTE
    random_state=42,
    n_jobs=-1                  # use all CPU cores
)
base_rf.fit(X_train, y_train)
print("  Training complete.")

# ─── 7. PROBABILITY CALIBRATION ───────────────────────────────────────────────
# Without calibration, RandomForest predict_proba() can be over-confident.
# CalibratedClassifierCV with sigmoid (Platt scaling) makes the probabilities
# actually correspond to real-world likelihoods.
print("\n" + "=" * 60)
print("STEP 6 — Calibrating probabilities (Platt scaling, cv=3)")
print("=" * 60)

calibrated_model = CalibratedClassifierCV(
    base_rf,
    method="sigmoid",   # Platt scaling (good for RF)
    cv=3                # 3-fold cross-validation during calibration
)
calibrated_model.fit(X_train, y_train)
print("  Calibration complete.")

# ─── 8. EVALUATE ──────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 7 — Evaluation on held-out test set")
print("=" * 60)

y_pred = calibrated_model.predict(X_test)
y_prob = calibrated_model.predict_proba(X_test)

print("\n  Per-class Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=le.classes_,
    digits=3
))

# Confidence calibration check
print("  Avg confidence per predicted class:")
for i, cls in enumerate(le.classes_):
    mask = y_pred == i
    if mask.sum() > 0:
        avg_conf = y_prob[mask, i].mean()
        correct_mask = mask & (y_pred == y_test)
        accuracy = correct_mask.sum() / mask.sum()
        print(f"    {cls:<22} avg_conf={avg_conf:.3f}  accuracy={accuracy:.3f}")

# Confusion matrix
print("\n  Confusion Matrix (rows=actual, cols=predicted):")
cm = confusion_matrix(y_test, y_pred)
header = "  " + "".join(f"{c[:8]:>10}" for c in le.classes_)
print(header)
for i, row in enumerate(cm):
    lbl = le.classes_[i][:10]
    print(f"  {lbl:<12}" + "".join(f"{v:>10}" for v in row))

# Multi-class ROC-AUC (macro)
try:
    auc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro")
    print(f"\n  ROC-AUC (macro, one-vs-rest): {auc:.4f}")
except Exception as e:
    print(f"\n  [WARN] ROC-AUC skipped: {e}")

# Brier score per class
print("\n  Brier Score per class (lower = better calibrated):")
for i, cls in enumerate(le.classes_):
    y_bin = (y_test == i).astype(int)
    bs = brier_score_loss(y_bin, y_prob[:, i])
    print(f"    {cls:<22} {bs:.4f}")

# ─── 9. FEATURE IMPORTANCE ────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 8 — Feature Importance (from base RF)")
print("=" * 60)

importances = base_rf.feature_importances_
sorted_idx = np.argsort(importances)[::-1]
for idx in sorted_idx:
    bar = "=" * int(importances[idx] * 60)
    print(f"  {FEATURES[idx]:<28} {importances[idx]:.4f}  {bar}")

# ─── 10. SHAP EXPLAINER ───────────────────────────────────────────────────────
# We build SHAP on the RAW base_rf (not the calibrated wrapper)
# because TreeExplainer works on tree-based models directly.
print("\n" + "=" * 60)
print("STEP 9 — Building SHAP TreeExplainer (~30s)")
print("=" * 60)

explainer = shap.TreeExplainer(base_rf)
print("  SHAP explainer ready.")

# Quick SHAP sanity check on 5 test samples
print("  Verifying SHAP values on 5 test samples...")
shap_vals = explainer.shap_values(X_test[:5])
if isinstance(shap_vals, list):
    print(f"  SHAP output: list of {len(shap_vals)} arrays, each shape {shap_vals[0].shape}")
else:
    print(f"  SHAP output: array shape {np.array(shap_vals).shape}")

# ─── 11. SAVE ─────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 10 — Saving model artifacts")
print("=" * 60)

pickle.dump(calibrated_model, open("model/model.pkl",         "wb"))
pickle.dump(le,               open("model/label_encoder.pkl", "wb"))
pickle.dump(explainer,        open("model/explainer.pkl",     "wb"))
pickle.dump(FEATURES,         open("model/features.pkl",      "wb"))
# Save feature importances for the dashboard
pickle.dump(
    {FEATURES[i]: float(importances[i]) for i in range(len(FEATURES))},
    open("model/feature_importances.pkl", "wb")
)

import os
for fname in ["model.pkl", "label_encoder.pkl", "explainer.pkl", "features.pkl", "feature_importances.pkl"]:
    size_kb = os.path.getsize(f"model/{fname}") / 1024
    print(f"  model/{fname:<30} {size_kb:.1f} KB")

print("\n" + "=" * 60)
print("  MODEL TRAINING COMPLETE!")
print(f"  Classes: {list(le.classes_)}")
print(f"  Features: {len(FEATURES)}")
print("=" * 60)