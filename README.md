# AgriConnect — Smart Agriculture & Farmer Marketplace

Production-style MVP monorepo implementing the complete farmer journey: crop recommendation, AI disease classification, crop growth advisory, direct farmer-to-buyer marketplace, and government scheme information.

## 1. Features

- Farmer / Buyer / Admin authentication with JWT + bcrypt
- Role-aware dashboards and protected routes
- Random Forest crop recommendation from soil/environment inputs
- MobileNetV3 transfer-learning disease classification pipeline
- Database-driven advisory for 15 Indian crops
- Farmer listings, buyer search/filter, offers, accept/reject and transaction workflow
- Government scheme search/filter and admin CRUD, with official source URLs and verification dates
- Responsive React UI, validation, loading/error/empty states and security middleware
- Local image storage fallback; optional Cloudinary integration
- Docker Compose for MongoDB, API, frontend and ML service

## 2. Architecture

```text
React/Vite + Tailwind
        |
        v
Node.js + Express REST API ---- MongoDB/Mongoose
        |
        +----------------------- FastAPI ML service
                                  |- Crop Random Forest
                                  `- Disease MobileNetV3
```

## 3. Requirements

- Node.js 20+
- npm 10+
- MongoDB 7/8, or Docker
- Python 3.11+
- For ML training: sufficient disk/RAM; GPU is optional

## 4. Local setup

```bash
git clone <your-repository>
cd agriconnect
npm install
```

Create the server environment file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Start MongoDB locally, then seed data:

```bash
npm run seed:crops --workspace server
npm run seed:diseases --workspace server
npm run seed:marketplace --workspace server
npm run seed:schemes --workspace server
npm run seed:admin --workspace server
```

Start the ML service in a separate terminal:

```bash
cd ml-service
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then from the repository root:

```bash
npm run dev
```

URLs:
- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health
- ML: http://localhost:8000/health

## 5. Demo accounts

After `seed:admin` and `seed:marketplace`:

- Admin: `admin@agriconnect.local` / `Admin@123`
- Farmer: `farmer.demo@agriconnect.local` / `Farmer@123`
- Buyer: `buyer.demo@agriconnect.local` / `Buyer@123`

Change/remove demo credentials before any public deployment.

## 6. Crop Recommendation ML

Place a legally obtained public crop-recommendation CSV at:

```text
ml-service/crop_recommendation/data/Crop_recommendation.csv
```

Required columns:

```text
N,P,K,temperature,humidity,ph,rainfall,label
```

Train:

```bash
cd ml-service
python crop_recommendation/train.py
```

Artifacts:

```text
ml-service/crop_recommendation/model/crop_recommender.joblib
ml-service/crop_recommendation/model/metadata.json
```

Inference endpoint: `POST /predict/crop`.

The model performs an 80/20 stratified split and returns the top probability-ranked crops. No fallback/fake prediction is generated when the artifact is missing.

## 7. Disease Detection ML

Use a legally obtained PlantVillage-compatible dataset with one folder per class:

```text
ml-service/disease_detection/data/plantvillage/
  Tomato___Early_blight/
  Tomato___Late_blight/
  Tomato___healthy/
  ...
```

Train:

```bash
cd ml-service
python disease_detection/train.py
```

Artifacts:

```text
ml-service/disease_detection/model/plant_disease.keras
ml-service/disease_detection/model/labels.txt
```

Inference endpoint: `POST /predict/disease`.

The API returns 503 if the trained model is unavailable. The UI lists supported classes and states that the output is a classification aid, not a definitive plant diagnosis.

## 8. Crop Advisory

Run:

```bash
npm run seed:crops --workspace server
```

The seeded database contains 15 crops and structured growing, irrigation, nutrient, disease, pest, harvest and storage fields. The `/advisory` page reads these records from MongoDB.

## 9. Marketplace

Routes include:

```text
GET  /api/listings
GET  /api/listings/:id
POST /api/listings
PUT  /api/listings/:id
DELETE /api/listings/:id
POST /api/offers
GET  /api/offers/my
PATCH /api/offers/:id/accept
PATCH /api/offers/:id/reject
GET  /api/transactions
GET  /api/transactions/:id
```

No real payment is processed. An accepted offer creates a transaction and reserves the listing.

## 10. Government schemes

Routes:

```text
GET    /api/schemes
GET    /api/schemes/:id
POST   /api/schemes       (admin)
PUT    /api/schemes/:id   (admin)
DELETE /api/schemes/:id   (admin)
```

Seed with:

```bash
npm run seed:schemes --workspace server
```

The seed contains official-source records for PM-KISAN, PMFBY, Agriculture Infrastructure Fund and e-NAM. Every record stores an official application URL, source URL and last-verified date. Always verify current eligibility, deadlines and rules on the official portal before applying.

## 11. Environment variables

Server:

```text
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
PORT=5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Client optional:

```text
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` or API credentials.

## 12. API documentation

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Crops:

```text
GET /api/crops
GET /api/crops/:id
POST /api/crops       (admin)
PUT /api/crops/:id   (admin)
DELETE /api/crops/:id (admin)
```

ML proxy:

```text
POST /api/recommend-crop
POST /api/detect-disease
```

Health:

```text
GET /api/health
```

## 13. Testing

Install dependencies first:

```bash
npm install
```

Run backend tests:

```bash
npm test
```

The test suite covers authentication, crop recommendation proxy behavior, listing creation, offer creation and scheme retrieval. For full integration tests, MongoDB and the ML service must be running.

## 14. Docker

For the complete container stack:

```bash
docker compose up --build
```

Services:
- MongoDB: 27017
- API: 5000
- ML service: 8000
- Frontend: 5173

For production, replace the example JWT secret, configure a managed MongoDB instance, configure Cloudinary or another object store, and use HTTPS/reverse proxy infrastructure.

## 15. Troubleshooting

**MongoDB connection failed** — start MongoDB or run `docker compose up mongodb`.

**ML returns 503** — train the relevant model and ensure the generated artifact is under the documented model directory.

**CORS error** — set `CLIENT_URL` to the exact frontend origin.

**Image upload fails** — use JPEG/PNG/WebP and keep the file at or below 5 MB.

**Empty advisory/schemes** — run the corresponding seed script.

## 16. Security notes

- JWT authentication and role authorization are enforced server-side.
- Passwords are bcrypt-hashed.
- Helmet, CORS and rate limiting are enabled.
- Request validation uses Zod where appropriate.
- Upload type and size are validated.
- Secrets are environment variables.
- Demo credentials are for local development only.

## 17. Future improvements

- Payment gateway with escrow/order reconciliation
- Cloud object storage and signed upload URLs
- Notifications and real-time offer updates
- Weather API integration
- More regional crop/disease models
- Human agronomist escalation workflow
- Advanced analytics and multilingual support

## 18. Final project status

Phase 1–9 implementation is present in this repository. Before production deployment, install dependencies, configure environment variables, seed MongoDB, train the ML models using legally obtained datasets, run tests, and perform environment-specific end-to-end testing.
