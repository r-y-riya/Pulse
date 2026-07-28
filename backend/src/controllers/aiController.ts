import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import AIReport from '../models/AIReport';
import WorkoutLog from '../models/WorkoutLog';
import CalculationService from '../services/calculationService';
import AIService from '../services/aiService';
import { Types } from 'mongoose';

export const optimizeWorkout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recoveryMetrics = await CalculationService.calculateRecoveryScore(userId);
    const trainingBalance = await CalculationService.calculateTrainingBalance(userId);
    const plateaus = await CalculationService.detectPlateaus(userId);
    const riskMetrics = await CalculationService.calculateRiskScore(userId);

    const recommendation = await AIService.generateWorkoutRecommendation({
      userProfile: user,
      recoveryMetrics,
      trainingBalance,
      plateaus,
      riskMetrics
    });

    res.json(recommendation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const askDietCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const answer = await AIService.answerNutritionQuery(question, user);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateWeeklyAIReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const rangeDays = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const logs = await WorkoutLog.find({
      userId,
      date: { $gte: startDate }
    });

    let totalVolume = 0;
    let totalRecovery = 0;
    logs.forEach(log => {
      log.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          if (s.completed) {
            totalVolume += (s.weight * s.reps);
          }
        });
      });
    });

    const recoveryScores = await Promise.all(logs.map(log => CalculationService.calculateRecoveryScore(userId)));
    if (recoveryScores.length > 0) {
      totalRecovery = recoveryScores.reduce((acc, current) => acc + current.score, 0) / recoveryScores.length;
    } else {
      totalRecovery = 85;
    }

    const trainingBalance = await CalculationService.calculateTrainingBalance(userId);
    const plateaus = await CalculationService.detectPlateaus(userId);

    const computedMetrics = {
      workoutsCompleted: logs.length,
      totalVolume,
      consistencyScore: Math.round((logs.length / (user.profile?.workoutDaysPerWeek || 4)) * 100),
      recoveryAverage: Math.round(totalRecovery),
      plateausDetected: plateaus.map(p => p.exerciseName),
      muscleImbalances: trainingBalance.imbalances
    };

    const reportContent = await AIService.generateReportInsights(computedMetrics, user);

    const reportData = {
      _id: new Types.ObjectId().toString(),
      userId,
      type: 'weekly',
      startDate,
      endDate: new Date(),
      metrics: computedMetrics,
      content: reportContent,
      generatedAt: new Date()
    };

    const report = new AIReport(reportData);
    await report.save();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAIReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await AIReport.find({ userId: req.user?.id }).sort({ generatedAt: -1 });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
