import axios from 'axios';
import Disease from '../models/Disease.js';

const mlUrl = () => (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');

export const detectDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Please upload a crop leaf image.');
      err.statusCode = 400;
      return next(err);
    }

    const form = new FormData();
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

    const response = await axios.post(`${mlUrl()}/predict/disease`, form, {
      timeout: 60000,
      headers: form.getHeaders ? form.getHeaders() : undefined,
      maxContentLength: 6 * 1024 * 1024,
      maxBodyLength: 6 * 1024 * 1024
    });

    const prediction = response.data;
    const disease = await Disease.findOne({
      cropName: new RegExp(`^${escapeRegex(prediction.crop)}$`, 'i'),
      name: new RegExp(`^${escapeRegex(prediction.disease)}$`, 'i')
    }).lean();

    res.json({
      ...prediction,
      confidencePercent: Number((prediction.confidence * 100).toFixed(1)),
      guidance: disease ? {
        symptoms: disease.symptoms || [],
        prevention: disease.prevention || [],
        management: disease.management || [],
        supported: disease.supported
      } : null,
      advisoryNotice: 'This is an AI classification result for supported classes, not a definitive plant diagnosis. Confirm important cases with a qualified agricultural expert.'
    });
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.detail || error.message || 'Disease detection service is unavailable.';
    const err = new Error(message);
    err.statusCode = status;
    next(err);
  }
};

export const getSupportedDiseases = async (_req, res, next) => {
  try {
    const mlResponse = await axios.get(`${mlUrl()}/supported/disease`, { timeout: 5000 });
    const classes = mlResponse.data.classes || [];
    const records = await Disease.find({ supported: true }).lean();
    const byKey = new Map(records.map(item => [`${item.cropName.toLowerCase()}::${item.name.toLowerCase()}`, item]));
    const diseases = classes.map(label => {
      const [rawCrop, rawDisease] = label.includes('___') ? label.split('___', 2) : ['Unknown', label];
      const cropName = rawCrop.replaceAll('_', ' ').replaceAll(',', ', ');
      const name = rawDisease.replaceAll('_', ' ');
      const record = byKey.get(`${cropName.toLowerCase()}::${name.toLowerCase()}`);
      return {
        cropName, name,
        symptoms: record?.symptoms || [],
        prevention: record?.prevention || [],
        management: record?.management || [],
        supported: true
      };
    });
    res.json({ diseases, modelTrained: Boolean(mlResponse.data.model_trained) });
  } catch (error) {
    next(error);
  }
};

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
