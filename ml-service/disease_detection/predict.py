from pathlib import Path
import io

import numpy as np
from PIL import Image


class DiseaseDetector:
    def __init__(self, model_dir: Path):
        self.path = model_dir / 'plant_disease.keras'
        self.labels_path = model_dir / 'labels.txt'
        self.available = self.path.exists() and self.labels_path.exists()
        self.model = None
        self.labels = []
        if self.available:
            import tensorflow as tf
            self.model = tf.keras.models.load_model(self.path)
            self.labels = [x.strip() for x in self.labels_path.read_text().splitlines() if x.strip()]
            if len(self.labels) == 0:
                self.available = False

    def predict(self, raw: bytes):
        image = Image.open(io.BytesIO(raw)).convert('RGB').resize((224, 224))
        array = np.asarray(image, dtype='float32')
        probabilities = self.model.predict(np.expand_dims(array, axis=0), verbose=0)[0]
        top_indices = np.argsort(probabilities)[::-1][:3]
        predictions = []
        for index in top_indices:
            label = self.labels[int(index)]
            crop, disease = self._split_label(label)
            predictions.append({
                'crop': crop,
                'disease': disease,
                'confidence': round(float(probabilities[index]), 6)
            })

        top = predictions[0]
        return {
            **top,
            'topPredictions': predictions,
            'model': 'MobileNetV3Small transfer learning',
            'supported': True,
            'mock': False
        }

    @staticmethod
    def _split_label(label: str):
        if '___' in label:
            crop, disease = label.split('___', 1)
        else:
            crop, disease = 'Unknown', label
        return crop.replace('_', ' '), disease.replace('_', ' ')
