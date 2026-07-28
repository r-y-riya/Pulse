import { Router, Response } from 'express';
import { logWorkout, getWorkoutHistory, deleteWorkoutLog, createWorkoutPlan, getWorkoutPlans, deleteWorkoutPlan, getWorkoutTelemetry } from '../controllers/workoutController';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import Exercise from '../models/Exercise';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';

const router = Router();

router.use(protect);

router.post('/log', logWorkout);
router.get('/history', getWorkoutHistory);
router.delete('/log/:id', deleteWorkoutLog);

router.post('/plan', createWorkoutPlan);
router.get('/plans', getWorkoutPlans);
router.delete('/plan/:id', deleteWorkoutPlan);

router.get('/telemetry', getWorkoutTelemetry);

// Static Exercise Library access endpoints
router.get('/exercises', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exercises = await Exercise.find({});
    res.json(exercises);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Achievements endpoint
router.get('/achievements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const achievements = await Achievement.find({ userId });
    res.json(achievements);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Notifications endpoint
router.get('/notifications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
