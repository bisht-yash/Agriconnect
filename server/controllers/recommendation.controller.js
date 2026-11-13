import axios from 'axios';

const mlUrl = () => (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');

export const recommendCrop = async (req, res, next) => {
  try {
    const response = await axios.post(`${mlUrl()}/predict/crop`, {
      nitrogen: Number(req.body.nitrogen),
      phosphorus: Number(req.body.phosphorus),
      potassium: Number(req.body.potassium),
      temperature: Number(req.body.temperature),
      humidity: Number(req.body.humidity),
      ph: Number(req.body.ph),
      rainfall: Number(req.body.rainfall),
      soil_type: req.body.soilType || 'unknown'
    }, { timeout: 15000 });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.detail || 'Crop recommendation service is unavailable.';
    const err = new Error(message); err.statusCode = status; next(err);
  }
};
