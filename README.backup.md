# AgriConnect – Phase 1

A production-style agriculture technology monorepo foundation for Smart Crop Recommendation, AI Disease Detection, Crop Advisory, Farmer-to-Buyer Marketplace and Government Schemes.

## Phase 1 delivered
- React + Vite + Tailwind responsive application shell
- Express REST API foundation with Helmet, CORS, rate limiting and error handling
- MongoDB/Mongoose schemas for User, Crop, Disease, ProductListing, Offer, Transaction and GovernmentScheme
- JWT/bcrypt authentication endpoints with farmer/buyer roles and admin authorization middleware
- Crop CRUD API foundation
- Separate FastAPI ML service with real model-loading inference paths
- Random Forest crop-recommendation training pipeline
- MobileNetV3 transfer-learning disease training pipeline
- Docker Compose foundation

## Run locally
Prerequisites: Node.js 20+, MongoDB 7/8+, Python 3.11+.

```bash
cd agriconnect
npm install
cp server/.env.example server/.env
npm run dev
```

Frontend: http://localhost:5173  |  API: http://localhost:5000/api/health  |  ML: run separately with `cd ml-service && python -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/uvicorn main:app --reload --port 8000`.

Windows Python activation: `.venv\\Scripts\\activate`.

## Crop ML dataset
Place a public crop recommendation CSV at `ml-service/crop_recommendation/data/Crop_recommendation.csv` with columns `N,P,K,temperature,humidity,ph,rainfall,label`, then run:
```bash
cd ml-service
python crop_recommendation/train.py
```
The generated model is `ml-service/crop_recommendation/model/crop_recommender.joblib`.

## Disease ML dataset
Use a legally obtained PlantVillage-style dataset with class folders under `ml-service/disease_detection/data/plantvillage/`. Then run:
```bash
cd ml-service
python disease_detection/train.py
```
The generated model and labels are stored under `ml-service/disease_detection/model/`.

The API intentionally returns a clear 503 when trained model artifacts are absent; it does not fabricate predictions.

## Environment
`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ML_SERVICE_URL`, and optional Cloudinary credentials are configured in `server/.env`. Never commit `.env`.

## Next phases
Phase 2: complete authentication UI, role-aware dashboards and protected React routes.
Phase 3: connect recommendation form to `/predict/crop`.
Phase 4: image upload + disease UI and advisory metadata.
Phase 5: crop seed data and advisory UI.
Phase 6: marketplace/offers/transactions.
Phase 7: verified government scheme ingestion/admin CRUD.
Phase 8–9: validation, tests, deployment, seed scripts and final integration.

## Phase 3 — Crop Recommendation ML

The crop recommendation flow is a real Random Forest inference pipeline. It does not return a fallback/fake crop when a trained artifact is missing.

### Dataset

Use the public Crop Recommendation Dataset with columns `N,P,K,temperature,humidity,ph,rainfall,label`. A public copy is documented at the GitHub repository `the-amazing-atharva/Crop-Recommendation`; the dataset contains 2,200 rows and these seven features plus the crop label. See the source linked in the project documentation before downloading it. The dataset is also described by public repositories as originating from the Kaggle Crop Recommendation Dataset.

Place the downloaded file here:

```text
ml-service/crop_recommendation/data/Crop_recommendation.csv
```

### Train

```bash
cd ml-service
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
python crop_recommendation/train.py
```

The training script performs an 80/20 stratified split, trains `RandomForestClassifier`, prints held-out accuracy and a classification report, and saves:

```text
ml-service/crop_recommendation/model/crop_recommender.joblib
ml-service/crop_recommendation/model/metadata.json
```

### Start ML service

```bash
uvicorn main:app --reload --port 8000
```

Health:

```text
GET http://localhost:8000/health
```

Prediction:

```text
POST http://localhost:8000/predict/crop
```

### Node API

Authenticated frontend requests use:

```text
POST /api/recommend-crop
```

Example JSON:

```json
{
  "nitrogen": 80,
  "phosphorus": 40,
  "potassium": 40,
  "temperature": 25,
  "humidity": 70,
  "ph": 6.5,
  "rainfall": 150,
  "soilType": "Loamy"
}
```

The response contains the model-selected crop, confidence, and the next two probability-ranked alternatives.

## Phase 4 — AI Disease Detection

The disease-detection module is implemented as a separate FastAPI service using MobileNetV3Small transfer learning. The Node API accepts JPEG/PNG/WebP uploads up to 5 MB, forwards the image to the ML service, and enriches matching classes with structured guidance from MongoDB.

### Disease dataset

Place PlantVillage (or a compatible image-folder dataset) under:

```text
ml-service/disease_detection/data/plantvillage/
```

with one directory per class, for example:

```text
Tomato___Early_blight/
Tomato___Late_blight/
Tomato___healthy/
```

Then train:

```bash
cd ml-service
pip install -r requirements.txt
python disease_detection/train.py
```

The trained model is saved at `ml-service/disease_detection/model/plant_disease.keras` and its exact class order is saved to `labels.txt`.

### Run

Start the ML service:

```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

Start the backend and frontend normally. The protected frontend route is `/disease` and the Node endpoint is `POST /api/detect-disease` with multipart field `image`.

If no trained model exists, the API returns HTTP 503 instead of generating a fake classification. The UI explicitly communicates that the model supports only its trained classes and that results are a classification aid rather than a definitive diagnosis.

Seed structured disease guidance with:

```bash
cd server
npm run seed:diseases
```
