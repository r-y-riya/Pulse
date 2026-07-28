import { Router } from 'express';
import { optimizeWorkout, askDietCoach, generateWeeklyAIReport, getAIReports } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';
import ReportService from '../services/reportService';

const router = Router();

router.use(protect);

router.post('/optimize', optimizeWorkout);
router.post('/coach', askDietCoach);
router.post('/report/weekly', generateWeeklyAIReport);
router.get('/reports', getAIReports);

// PDF Export Report Endpoint
router.get('/report/download/:type', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const type = req.params.type as 'weekly' | 'monthly';
    if (type !== 'weekly' && type !== 'monthly') {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    await ReportService.generatePDFReport(userId, type, res);
  } catch (err: any) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
