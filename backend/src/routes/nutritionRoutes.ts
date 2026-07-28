import { Router } from 'express';
import { logNutrition, getNutritionLog, deleteMeal, generateAIMealPlan } from '../controllers/nutritionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/log', logNutrition);
router.get('/log/:date', getNutritionLog);
router.delete('/log/:date/:mealId', deleteMeal);
router.post('/meal-plan', generateAIMealPlan);

export default router;
