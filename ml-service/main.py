from pathlib import Path
from typing import Annotated
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from crop_recommendation.predict import CropRecommender
from disease_detection.predict import DiseaseDetector

app=FastAPI(title='AgriConnect ML Service',version='1.0.0')
crop=CropRecommender(Path(__file__).parent/'crop_recommendation/model')
disease=DiseaseDetector(Path(__file__).parent/'disease_detection/model')
class CropInput(BaseModel):
    nitrogen: float=Field(ge=0,le=300); phosphorus: float=Field(ge=0,le=300); potassium: float=Field(ge=0,le=300)
    ph: float=Field(ge=0,le=14); temperature: float=Field(ge=-20,le=70); humidity: float=Field(ge=0,le=100); rainfall: float=Field(ge=0,le=5000); soil_type: str='unknown'
@app.get('/health')
def health(): return {'status':'ok','crop_model':crop.available,'disease_model':disease.available}
@app.post('/predict/crop')
def predict_crop(data:CropInput):
    if not crop.available: raise HTTPException(503,'Crop model is not trained. Run the training script first.')
    return crop.predict(data.model_dump())
@app.get('/supported/disease')
def supported_disease():
    labels = disease.labels
    if not labels:
        fallback = Path(__file__).parent / 'disease_detection' / 'supported_classes.txt'
        if fallback.exists():
            labels = [x.strip() for x in fallback.read_text(encoding='utf-8').splitlines() if x.strip()]
    return {'classes': labels, 'model_trained': disease.available}

@app.post('/predict/disease')
async def predict_disease(file:Annotated[UploadFile,File()]):
    if file.content_type not in {'image/jpeg','image/png','image/webp'}: raise HTTPException(400,'Only JPEG, PNG and WebP images are supported.')
    raw=await file.read()
    if len(raw)>5*1024*1024: raise HTTPException(413,'Image must be 5 MB or smaller.')
    if not disease.available: raise HTTPException(503,'Disease model is not trained. Run the training script first.')
    return disease.predict(raw)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)