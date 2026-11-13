import { Router } from 'express';
import { getAdminStats } from '../controllers/dashboard.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
const router = Router();
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
export default router;
