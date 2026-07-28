import { Router } from 'express';
import { calculateHealthMetrics, getHealthHistory } from '../controllers/healthController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/calculate', calculateHealthMetrics);
router.get('/history', getHealthHistory);

export default router;
