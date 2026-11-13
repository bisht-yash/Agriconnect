import { Router } from 'express';
import { listSchemes,getScheme,createScheme,updateScheme,deleteScheme } from '../controllers/scheme.controller.js';
import { protect,authorize } from '../middleware/auth.middleware.js';
const r=Router();
r.get('/',listSchemes); r.get('/:id',getScheme); r.post('/',protect,authorize('admin'),createScheme); r.put('/:id',protect,authorize('admin'),updateScheme); r.delete('/:id',protect,authorize('admin'),deleteScheme);
export default r;
