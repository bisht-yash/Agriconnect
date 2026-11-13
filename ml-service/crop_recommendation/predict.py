from pathlib import Path
import joblib
import numpy as np

class CropRecommender:
    def __init__(self, model_dir: Path):
        self.path = model_dir / 'crop_recommender.joblib'
        self.available = self.path.exists()
        self.bundle = joblib.load(self.path) if self.available else None

    def predict(self, data):
        if not self.available:
            raise RuntimeError('Crop model is not trained.')
        x = np.array([[
            data['nitrogen'], data['phosphorus'], data['potassium'],
            data['temperature'], data['humidity'], data['ph'], data['rainfall']
        ]], dtype=float)
        model = self.bundle['model']
        probabilities = model.predict_proba(x)[0]
        classes = model.classes_
        order = np.argsort(probabilities)[::-1][:3]
        return {
            'recommendedCrop': str(classes[order[0]]),
            'confidence': round(float(probabilities[order[0]]), 4),
            'alternatives': [
                {'crop': str(classes[i]), 'probability': round(float(probabilities[i]), 4)}
                for i in order[1:]
            ],
            'model': 'RandomForestClassifier'
        }
