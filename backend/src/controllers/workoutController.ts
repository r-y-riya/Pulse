import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import WorkoutLog from '../models/WorkoutLog';
import WorkoutPlan from '../models/WorkoutPlan';
import Exercise from '../models/Exercise';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';
import CalculationService from '../services/calculationService';
import { Types } from 'mongoose';

// Log a completed workout
export const logWorkout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, exercises, duration, calories, mood, energy, soreness, sleepHours, notes, date } = req.body;

    const log = new WorkoutLog({
      userId,
      name,
      exercises,
      duration,
      calories: calories || (duration * 6),
      mood,
      energy,
      soreness,
      sleepHours,
      notes,
      date: date || new Date()
    });

    await log.save();
    checkAchievements(userId);
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get completed workout history
export const getWorkoutHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await WorkoutLog.find({ userId: req.user?.id }).sort({ date: -1 });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Workout log deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a planned workout template
export const createWorkoutPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, dayOfWeek, date, exercises, notes, estimatedDuration, estimatedCalories } = req.body;

    const plan = new WorkoutPlan({
      userId: req.user?.id,
      name,
      dayOfWeek,
      date,
      exercises,
      notes,
      estimatedDuration,
      estimatedCalories
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all workout plans
export const getWorkoutPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.user?.id });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a planned workout
export const deleteWorkoutPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate all health analytics
export const getWorkoutTelemetry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const recovery = await CalculationService.calculateRecoveryScore(userId);
    const balance = await CalculationService.calculateTrainingBalance(userId);
    const plateaus = await CalculationService.detectPlateaus(userId);
    const risk = await CalculationService.calculateRiskScore(userId);
    const streaks = await CalculationService.calculateStreaks(userId);

    res.json({
      recovery,
      balance,
      plateaus,
      risk,
      streaks
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Check achievements & trigger unlocking
const checkAchievements = async (userId: string) => {
  try {
    const logs = await WorkoutLog.find({ userId });
      
    if (logs.length === 0) return;

    if (logs.length >= 100) {
      await unlockBadge(userId, 'workouts_100', 'Centurion Lifter', 'Completed 100 recorded workouts!');
    }
    if (logs.length >= 1) {
      await unlockBadge(userId, 'first_pr', 'Iron Pioneer', 'Logged your first official workout session.');
    }

    let totalVolume = 0;
    logs.forEach(log => {
      log.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          if (s.completed) totalVolume += (s.weight * s.reps);
        });
      });
    });

    if (totalVolume >= 10000) {
      await unlockBadge(userId, 'volume_10000', 'Titanium Force', 'Lifting volume exceeded 10,000 kg total volume.');
    }

    const streaks = await CalculationService.calculateStreaks(userId);
    if (streaks.longestStreak >= 7) {
      await unlockBadge(userId, 'streak_7', 'Sustained Momentum', 'Maintained a workout consistency streak of 7 days.');
    }
    if (streaks.longestStreak >= 30) {
      await unlockBadge(userId, 'streak_30', 'Unstoppable Momentum', 'Maintained a workout consistency streak of 30 days.');
    }
  } catch (err) {
    console.error("Error evaluating achievements:", err);
  }
};

const unlockBadge = async (userId: string, badgeId: string, title: string, description: string) => {
  try {
    const existing = await Achievement.findOne({ userId, badgeId });
    if (existing) return;

    const achievement = new Achievement({ userId, badgeId, title, description });
    await achievement.save();

    const notif = new Notification({
      userId,
      title: `Badge Unlocked: ${title}`,
      message: `Congratulations! You unlocked the achievement "${title}": ${description}`,
      type: 'achievement'
    });
    await notif.save();
  } catch (err: any) {
    if (err.code !== 11000) console.error(err);
  }
};
