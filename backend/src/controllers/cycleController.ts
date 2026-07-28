import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import CycleLog from '../models/CycleLog';

export const logCycleDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, cycleLength, periodLength, date, symptoms, flow, mood, energy, painLevel } = req.body;
    const userId = req.user?.id;

    let log = await CycleLog.findOne({ userId }).sort({ startDate: -1 });

    if (startDate) {
      log = new CycleLog({
        userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        cycleLength: cycleLength || 28,
        periodLength: periodLength || 5,
        dailyLogs: []
      });
      await log.save();
      return res.status(201).json(log);
    }

    if (!log) {
      log = new CycleLog({
        userId,
        startDate: new Date(),
        cycleLength: 28,
        periodLength: 5,
        dailyLogs: []
      });
    }

    if (endDate && !startDate) {
      log.endDate = new Date(endDate);
    }

    if (date) {
      const logStr = new Date(date).toISOString().split('T')[0];
      const existingIdx = log.dailyLogs.findIndex(d => d.date === logStr);

      if (existingIdx > -1) {
        const entry = log.dailyLogs[existingIdx];
        entry.symptoms = symptoms || [];
        entry.flow = flow || 'none';
        entry.mood = mood || 'calm';
        entry.energy = energy || 3;
        entry.painLevel = painLevel || 0;
      } else {
        log.dailyLogs.push({
          date: logStr,
          symptoms: symptoms || [],
          flow: flow || 'none',
          mood: mood || 'calm',
          energy: energy || 3,
          painLevel: painLevel || 0
        } as any);
      }
    }

    await log.save();
    res.json(log);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCycleAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const log = await CycleLog.findOne({ userId }).sort({ startDate: -1 });

    if (!log) {
      return res.json({
        hasData: false,
        phase: 'unknown',
        daysUntilNext: 28,
        currentDay: 1,
        recommendation: 'Register cycle start date to receive workout recommendations.'
      });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(log.startDate);
    start.setHours(0,0,0,0);

    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = ((diffDays - 1) % log.cycleLength) + 1;

    let phase = 'follicular';
    let recommendation = '';
    let phaseTitle = 'Follicular Phase';

    if (currentDay <= log.periodLength) {
      phase = 'menstruation';
      phaseTitle = 'Menstrual Phase';
      recommendation = "Hormones (estrogen & progesterone) are at their lowest. Focus on low-intensity movement: yoga, walking, and passive mobility drills. Keep hydration levels high.";
    } else if (currentDay > log.periodLength && currentDay <= 13) {
      phase = 'follicular';
      phaseTitle = 'Follicular Phase';
      recommendation = "Estrogen is rising, lifting energy levels. Ideal for strength training, lifting heavy sets, and testing progressive overload. Your muscles recover faster during this phase.";
    } else if (currentDay === 14) {
      phase = 'ovulation';
      phaseTitle = 'Ovulatory Phase';
      recommendation = "Estrogen peaks. Your physical strength, power output, and confidence are at their highest. Great day for testing Personal Records (PRs) or high-intensity HIIT sprints.";
    } else {
      phase = 'luteal';
      phaseTitle = 'Luteal Phase';
      recommendation = "Progesterone rises. Core temperature is higher, and endurance capacity decreases. Transition to moderate-intensity training, higher rest intervals, and recovery-focused yoga.";
    }

    const nextPeriodDate = new Date(start);
    nextPeriodDate.setDate(start.getDate() + log.cycleLength);
    
    const daysUntilNext = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const ovulationDate = new Date(start);
    ovulationDate.setDate(start.getDate() + log.cycleLength - 14);

    res.json({
      hasData: true,
      currentDay,
      cycleLength: log.cycleLength,
      periodLength: log.periodLength,
      phase,
      phaseTitle,
      recommendation,
      nextPeriod: nextPeriodDate,
      daysUntilNext: daysUntilNext > 0 ? daysUntilNext : 0,
      ovulationDate,
      dailyLogs: log.dailyLogs
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
