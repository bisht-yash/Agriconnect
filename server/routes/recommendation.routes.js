import { Router } from 'express';
import { recommendCrop } from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', protect, recommendCrop);
export default router;
