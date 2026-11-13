"""Train the AgriConnect crop recommender from the public Crop Recommendation dataset.

Expected CSV columns: N,P,K,temperature,humidity,ph,rainfall,label
Place the CSV at crop_recommendation/data/Crop_recommendation.csv.
"""
from pathlib import Path
import json
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE = Path(__file__).resolve().parent
DATA = BASE / 'data' / 'Crop_recommendation.csv'
OUT = BASE / 'model'
OUT.mkdir(parents=True, exist_ok=True)
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
TARGET = 'label'


def main():
    if not DATA.exists():
        raise FileNotFoundError(f'Dataset not found: {DATA}\nDownload the public dataset and place it there.')
    df = pd.read_csv(DATA)
    missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f'Missing required columns: {missing}')
    df = df[FEATURES + [TARGET]].dropna().drop_duplicates()
    X, y = df[FEATURES], df[TARGET].astype(str)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=300, max_depth=None, min_samples_split=2,
        random_state=42, n_jobs=-1, class_weight=None
    )
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, pred)
    print(f'Test accuracy: {accuracy:.4f}')
    print(classification_report(y_test, pred, zero_division=0))
    joblib.dump({'model': model, 'features': FEATURES}, OUT / 'crop_recommender.joblib')
    (OUT / 'metadata.json').write_text(json.dumps({
        'model': 'RandomForestClassifier', 'features': FEATURES,
        'classes': sorted(y.unique().tolist()), 'testAccuracy': accuracy,
        'rowsUsed': len(df)
    }, indent=2))

if __name__ == '__main__':
    main()
