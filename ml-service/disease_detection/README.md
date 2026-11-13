# Disease Detection ML Service

AgriConnect uses a MobileNetV3Small transfer-learning classifier for supported PlantVillage-style classes.

## Dataset

Place the extracted dataset at:

`ml-service/disease_detection/data/plantvillage/`

Each immediate subdirectory must represent a class, for example:

```text
plantvillage/
├── Tomato___Early_blight/
│   ├── image_001.jpg
│   └── image_002.jpg
├── Tomato___Late_blight/
└── Tomato___healthy/
```

The training script reads the folder names directly, so the same labels are used during inference.

## Train

From `ml-service/`:

```bash
pip install -r requirements.txt
python disease_detection/train.py
```

Generated files:

```text
disease_detection/model/
├── plant_disease.keras
├── labels.txt
└── metrics.txt
```

The application does not fabricate predictions if the model is missing. The inference API returns HTTP 503 until a trained model exists.

## Inference

The FastAPI endpoint is:

```text
POST /predict/disease
Content-Type: multipart/form-data
file=<image>
```

Supported upload types: JPEG, PNG, WebP. Maximum size: 5 MB.

The model returns the top prediction and the top three class probabilities.

## Scope

PlantVillage-style classification is limited to the classes represented in the trained dataset. A result is a classification aid, not a definitive agricultural diagnosis. Important cases should be confirmed using local agricultural expertise.
