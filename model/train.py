import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import shap, pickle, json

df = pd.read_csv("data/logs.csv")

FEATURES = [
    "dst_port", "bytes_out", "status_code",
    "failed_logins_1min", "unique_dst_ips_5min", "connection_interval_std"
]

le = LabelEncoder()
df['label_enc'] = le.fit_transform(df['label'])

X = df[FEATURES]
y = df['label_enc']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test), target_names=le.classes_))

# SHAP
explainer = shap.TreeExplainer(model)

# Save everything
pickle.dump(model, open("model/model.pkl", "wb"))
pickle.dump(le, open("model/label_encoder.pkl", "wb"))
pickle.dump(explainer, open("model/explainer.pkl", "wb"))
print("Model saved.")