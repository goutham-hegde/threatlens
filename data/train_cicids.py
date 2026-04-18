import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import shap, pickle

# Load CICIDS
df = pd.read_csv("data/Wednesday-workingHours.pcap_ISCX.csv")
df.columns = df.columns.str.strip()  # CICIDS has whitespace in column names

# Map CICIDS labels to your threat types
LABEL_MAP = {
    "BENIGN":              "benign",
    "DoS Hulk":            "brute_force",
    "DoS GoldenEye":       "brute_force",
    "DoS slowloris":       "brute_force",
    "DoS Slowhttptest":    "brute_force",
    "Heartbleed":          "data_exfiltration",
    "Infiltration":        "lateral_movement",
    "Bot":                 "c2_beacon",
    "Web Attack":          "brute_force",
}
df["label"] = df["Label"].map(LABEL_MAP).fillna("benign")

# CICIDS columns that map to your features
FEATURE_MAP = {
    "Destination Port":          "dst_port",
    "Total Length of Fwd Packets": "bytes_out",
    "Flow Duration":             "connection_interval_std",
    "Fwd Packets/s":             "failed_logins_1min",
    "Flow Packets/s":            "unique_dst_ips_5min",
    "Average Packet Size":       "status_code",
}
df = df.rename(columns=FEATURE_MAP)

FEATURES = list(FEATURE_MAP.values())

# Clean — CICIDS has inf and NaN values
df = df.replace([float("inf"), float("-inf")], pd.NA).dropna(subset=FEATURES)

# Combine with your synthetic data for better false positive coverage
synthetic = pd.read_csv("data/logs.csv")[FEATURES + ["label"]]
df_combined = pd.concat([df[FEATURES + ["label"]], synthetic], ignore_index=True)

# Sample to keep training fast (CICIDS is 700k rows)
df_combined = pd.concat([
    g.sample(min(len(g), 5000), random_state=42) 
    for _, g in df_combined.groupby("label")
], ignore_index=True)

print("Label distribution:")
print(df_combined["label"].value_counts())

# Train
le = LabelEncoder()
df_combined["label_enc"] = le.fit_transform(df_combined["label"])

X = df_combined[FEATURES]
y = df_combined["label_enc"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

print("\nClassification Report:")
print(classification_report(y_test, model.predict(X_test), target_names=le.classes_))

# SHAP explainer
explainer = shap.TreeExplainer(model)

# Save — overwrites your existing model files
pickle.dump(model,     open("model/model.pkl",         "wb"))
pickle.dump(le,        open("model/label_encoder.pkl", "wb"))
pickle.dump(explainer, open("model/explainer.pkl",     "wb"))
pickle.dump(FEATURES,  open("model/features.pkl",      "wb"))

print("\nModel saved. Ready.")