import { Router } from 'express';
import { listCrops,getCrop,createCrop,updateCrop,deleteCrop } from '../controllers/crop.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
const r=Router();
r.get('/',listCrops);r.get('/:id',getCrop);r.post('/',protect,authorize('admin'),createCrop);r.put('/:id',protect,authorize('admin'),updateCrop);r.delete('/:id',protect,authorize('admin'),deleteCrop);
export default r;
