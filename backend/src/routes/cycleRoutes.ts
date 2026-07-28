import { Router } from 'express';
import { logCycleDetails, getCycleAnalytics } from '../controllers/cycleController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/log', logCycleDetails);
router.get('/analytics', getCycleAnalytics);

export default router;
