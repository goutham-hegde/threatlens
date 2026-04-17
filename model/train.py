import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import shap
import pickle

print("Loading data...")
df = pd.read_csv("data/logs.csv")

# -------------------------------------------------------
# FEATURES: These are the columns the model will USE to learn
# We don't use src_ip, dst_ip, timestamp — those are identifiers
# We use the numeric patterns that reveal attack behavior
# -------------------------------------------------------
FEATURES = [
    "dst_port",
    "bytes_out",
    "status_code",
    "failed_logins_1min",
    "unique_dst_ips_5min",
    "connection_interval_std"
]

# -------------------------------------------------------
# LABEL ENCODING
# ML models only understand numbers, not text
# So we convert: benign=0, brute_force=1, c2_beacon=2, lateral_movement=3
# -------------------------------------------------------
le = LabelEncoder()
df['label_enc'] = le.fit_transform(df['label'])

print(f"Classes found: {list(le.classes_)}")
print(f"Encoded as:    {list(range(len(le.classes_)))}")

# -------------------------------------------------------
# SPLIT DATA
# 80% of rows = training data (model learns from these)
# 20% of rows = test data (we check accuracy on these)
# The model NEVER sees test data during training
# -------------------------------------------------------
X = df[FEATURES]   # inputs (the 6 feature columns)
y = df['label_enc'] # outputs (the label column, now numbers)

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,      # 20% for testing
    random_state=42     # fixed seed so results are reproducible
)

print(f"\nTraining rows: {len(X_train)}")
print(f"Testing rows:  {len(X_test)}")

# -------------------------------------------------------
# TRAIN THE MODEL
# RandomForest = 100 decision trees voting together
# class_weight='balanced' makes it pay equal attention
# to rare classes (lateral_movement only has 50 rows)
# -------------------------------------------------------
print("\nTraining Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)
print("Training complete [DONE]")

# -------------------------------------------------------
# TEST THE MODEL
# Show results on the 20% it never saw during training
# precision/recall/f1 close to 1.00 = excellent
# -------------------------------------------------------
print("\n--- MODEL ACCURACY REPORT ---")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=le.classes_))

# -------------------------------------------------------
# SHAP EXPLAINER
# This lets us later ask "WHY did you flag this event?"
# and get a human-readable answer
# -------------------------------------------------------
print("Building SHAP explainer (this takes ~30 seconds)...")
explainer = shap.TreeExplainer(model)
print("SHAP ready [DONE]")

# -------------------------------------------------------
# SAVE EVERYTHING
# pickle.dump = save Python object to a file
# pickle.load = load it back later
# -------------------------------------------------------
pickle.dump(model,    open("model/model.pkl",         "wb"))
pickle.dump(le,       open("model/label_encoder.pkl", "wb"))
pickle.dump(explainer,open("model/explainer.pkl",     "wb"))
pickle.dump(FEATURES, open("model/features.pkl",      "wb"))

print("\n[DONE] All files saved to model/ folder:")
print("  model/model.pkl")
print("  model/label_encoder.pkl")
print("  model/explainer.pkl")
print("  model/features.pkl")