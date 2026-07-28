import WorkoutLog from '../models/WorkoutLog';
import { Types } from 'mongoose';

export interface RecoveryMetrics {
  score: number;
  sleepScore: number;
  energyScore: number;
  sorenessScore: number;
  intensityScore: number;
}

export interface TrainingBalanceMetrics {
  push: number;
  pull: number;
  legs: number;
  core: number;
  cardio: number;
  mobility: number;
  imbalances: string[];
}

export interface PlateauInfo {
  exerciseName: string;
  sessionsTested: number;
  isPlateaued: boolean;
  reason?: string;
}

export class CalculationService {
  // Retrieves logs from MongoDB via Mongoose
  private static async getLogs(userId: string | Types.ObjectId, limit?: number, gteDate?: Date): Promise<any[]> {
    let query: any = { userId };
    if (gteDate) {
      query.date = { $gte: gteDate };
    }
    let findQuery = WorkoutLog.find(query).sort({ date: -1 });
    if (limit) {
      findQuery = findQuery.limit(limit);
    }
    return findQuery;
  }

  /**
   * Calculates a CNS recovery score (0 - 100%) programmatically.
   * Recovery = 0.35 * SleepScore + 0.25 * EnergyScore - 0.20 * SorenessScore - 0.20 * PreviousIntensityScore
   */
  static async calculateRecoveryScore(userId: string | Types.ObjectId): Promise<RecoveryMetrics> {
    const recentLogs = await this.getLogs(userId, 1);
    
    if (recentLogs.length === 0) {
      return {
        score: 85, // Default baseline for new users
        sleepScore: 80,
        energyScore: 80,
        sorenessScore: 20,
        intensityScore: 30
      };
    }

    const lastLog = recentLogs[0];
    
    // Scale sleep: 8 hours = 100%, 7 hours = 85%, etc.
    const sleepHours = lastLog.sleepHours || 8;
    const sleepScore = Math.min(100, Math.max(0, (sleepHours / 8) * 100));
    
    // Scale energy: 1 to 5 -> 20 to 100%
    const energyScore = (lastLog.energy || 3) * 20;

    // Scale soreness: 1 to 5 -> 20 to 100%. Soreness reduces recovery.
    const sorenessScore = (lastLog.soreness || 2) * 20;

    // Previous intensity based on average RPE in completed sets
    let totalRpe = 0;
    let setCount = 0;
    lastLog.exercises.forEach((ex: any) => {
      ex.sets.forEach((s: any) => {
        if (s.completed) {
          totalRpe += s.rpe || 8;
          setCount++;
        }
      });
    });
    
    const avgRpe = setCount > 0 ? totalRpe / setCount : 8;
    const intensityScore = (avgRpe / 10) * 100;

    const score = Math.round(
      0.35 * sleepScore +
      0.25 * energyScore +
      0.20 * (100 - sorenessScore) +
      0.20 * (100 - intensityScore)
    );

    return {
      score: Math.min(100, Math.max(10, score)),
      sleepScore: Math.round(sleepScore),
      energyScore: Math.round(energyScore),
      sorenessScore: Math.round(sorenessScore),
      intensityScore: Math.round(intensityScore)
    };
  }

  /**
   * Analyzes volume distribution to identify muscle imbalances.
   */
  static async calculateTrainingBalance(userId: string | Types.ObjectId): Promise<TrainingBalanceMetrics> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const logs = await this.getLogs(userId, undefined, oneWeekAgo);

    let pushSets = 0;
    let pullSets = 0;
    let legsSets = 0;
    let coreSets = 0;
    let cardioSessions = 0;
    let mobilitySessions = 0;

    logs.forEach(log => {
      log.exercises.forEach((ex: any) => {
        const cat = (ex.category || '').toLowerCase();
        const setsCount = ex.sets.filter((s: any) => s.completed).length;

        if (cat === 'cardio') {
          cardioSessions += 1;
        } else if (cat === 'mobility') {
          mobilitySessions += 1;
        } else {
          const name = ex.name.toLowerCase();
          const chestTricepsShoulders = ['chest', 'bench', 'push', 'press', 'dip', 'tricep', 'shoulder', 'overhead', 'lateral'];
          const backBiceps = ['pull', 'row', 'chin', 'lats', 'bicep', 'curl', 'deadlift', 'rear'];
          const lowerBody = ['squat', 'leg', 'lunge', 'calf', 'hamstring', 'quad', 'calf', 'glute'];
          const absCore = ['plank', 'crunch', 'core', 'abs', 'hanging'];

          if (chestTricepsShoulders.some(k => name.includes(k))) {
            pushSets += setsCount;
          } else if (backBiceps.some(k => name.includes(k))) {
            pullSets += setsCount;
          } else if (lowerBody.some(k => name.includes(k))) {
            legsSets += setsCount;
          } else if (absCore.some(k => name.includes(k))) {
            coreSets += setsCount;
          } else {
            pushSets += Math.round(setsCount / 3);
            pullSets += Math.round(setsCount / 3);
            legsSets += Math.round(setsCount / 3);
          }
        }
      });
    });

    const imbalances: string[] = [];
    if (pushSets > 0 && pullSets === 0) {
      imbalances.push("Extreme Push/Pull imbalance: Logged push exercises but 0 pulling exercises.");
    } else if (pushSets > 1.5 * pullSets) {
      imbalances.push(`Push-dominant pattern: Push volume (${pushSets} sets) is significantly higher than Pull volume (${pullSets} sets).`);
    } else if (pullSets > 1.5 * pushSets) {
      imbalances.push(`Pull-dominant pattern: Pull volume (${pullSets} sets) is significantly higher than Push volume (${pushSets} sets).`);
    }

    if (pushSets + pullSets > 2 * legsSets && (pushSets + pullSets) > 10) {
      imbalances.push(`Upper-body dominant pattern: Neglecting lower body training relative to upper body volume.`);
    }

    if (logs.length > 2 && coreSets === 0) {
      imbalances.push("Core training missed: You did not log any core stability/strength exercises.");
    }

    return {
      push: pushSets,
      pull: pullSets,
      legs: legsSets,
      core: coreSets,
      cardio: cardioSessions * 3,
      mobility: mobilitySessions * 3,
      imbalances
    };
  }

  /**
   * Plateau Detection
   */
  static async detectPlateaus(userId: string | Types.ObjectId): Promise<PlateauInfo[]> {
    const logs = await this.getLogs(userId, 10);
    if (logs.length < 3) return [];

    const exerciseSessionsMap: { [key: string]: number[] } = {};
    const chronologicalLogs = [...logs].reverse();

    chronologicalLogs.forEach(log => {
      const loggedExercises = new Set<string>();

      log.exercises.forEach((ex: any) => {
        const name = ex.name;
        if (loggedExercises.has(name)) return;
        loggedExercises.add(name);

        let max1RM = 0;
        ex.sets.forEach((s: any) => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            const e1rm = s.weight * (1 + s.reps / 30);
            if (e1rm > max1RM) max1RM = e1rm;
          }
        });

        if (max1RM > 0) {
          if (!exerciseSessionsMap[name]) {
            exerciseSessionsMap[name] = [];
          }
          exerciseSessionsMap[name].push(max1RM);
        }
      });
    });

    const plateaus: PlateauInfo[] = [];

    Object.keys(exerciseSessionsMap).forEach(name => {
      const weights = exerciseSessionsMap[name];
      if (weights.length >= 3) {
        const last3 = weights.slice(-3);
        const [w1, w2, w3] = last3;

        if (w3 <= w1 * 1.01) {
          plateaus.push({
            exerciseName: name,
            sessionsTested: weights.length,
            isPlateaued: true,
            reason: `Estimated 1RM progressed from ${w1.toFixed(1)}kg to ${w2.toFixed(1)}kg and then stalled at ${w3.toFixed(1)}kg.`
          });
        }
      }
    });

    return plateaus;
  }

  /**
   * Workout Risk Score
   */
  static async calculateRiskScore(userId: string | Types.ObjectId): Promise<{ score: number; warnings: string[] }> {
    const logs = await this.getLogs(userId, 15);
    const warnings: string[] = [];

    if (logs.length < 2) {
      return { score: 10, warnings: [] };
    }

    const now = new Date();
    const past7Days = logs.filter(log => {
      const diffTime = Math.abs(now.getTime() - new Date(log.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    if (past7Days.length >= 6) {
      warnings.push("High frequency warning: Training 6 or more days in a single week leaves insufficient time for systemic CNS recovery.");
    }

    let week1Volume = 0;
    let week2Volume = 0;

    logs.forEach(log => {
      const diffTime = Math.abs(now.getTime() - new Date(log.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let logVol = 0;
      log.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          if (s.completed) {
            logVol += (s.weight * s.reps);
          }
        });
      });

      if (diffDays <= 7) {
        week1Volume += logVol;
      } else if (diffDays <= 14) {
        week2Volume += logVol;
      }
    });

    let riskScore = 15;

    if (week2Volume > 1000) {
      const volumeIncreaseRatio = week1Volume / week2Volume;
      if (volumeIncreaseRatio > 1.15) {
        riskScore += 35;
        warnings.push(`Acute volume spike detected: Training load spiked by ${Math.round((volumeIncreaseRatio - 1) * 100)}% this week compared to last week (WoW). Maintain volume changes below 15% to prevent joint and tendon strain.`);
      }
    }

    // Check muscle training frequency
    for (let i = 0; i < logs.length - 1; i++) {
      const logA = logs[i];
      const logB = logs[i + 1];
      const diffHours = Math.abs(new Date(logA.date).getTime() - new Date(logB.date).getTime()) / (1000 * 60 * 60);

      if (diffHours < 44) {
        const namesA = new Set(logA.exercises.map((e: any) => e.name.toLowerCase()));
        const overlaps = logB.exercises.filter((e: any) => namesA.has(e.name.toLowerCase())).map((e: any) => e.name);

        if (overlaps.length > 0) {
          riskScore += 20;
          warnings.push(`Rest window violation: Repeated compound exercise "${overlaps[0]}" with only ${Math.round(diffHours)} hours rest. Muscles require 48 hours for local fiber repair.`);
          break;
        }
      }
    }

    return {
      score: Math.min(100, riskScore),
      warnings
    };
  }

  /**
   * Calculates streaks
   */
  static async calculateStreaks(userId: string | Types.ObjectId): Promise<{ currentStreak: number; longestStreak: number }> {
    const logs = await this.getLogs(userId);
    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const uniqueDates = Array.from(new Set(
      logs.map(log => new Date(log.date).toDateString())
    )).map(d => new Date(d));

    uniqueDates.sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstDate = uniqueDates[0];
    firstDate.setHours(0,0,0,0);
    
    const hasCurrent = (firstDate.getTime() === today.getTime() || firstDate.getTime() === yesterday.getTime());

    if (hasCurrent) {
      currentStreak = 1;
      let checkDate = new Date(firstDate);

      for (let i = 1; i < uniqueDates.length; i++) {
        const d = uniqueDates[i];
        d.setHours(0,0,0,0);
        
        const diff = (checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          currentStreak++;
          checkDate = d;
        } else if (diff > 1) {
          break;
        }
      }
    }

    if (uniqueDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      let checkDate = new Date(uniqueDates[0]);
      checkDate.setHours(0,0,0,0);

      for (let i = 1; i < uniqueDates.length; i++) {
        const d = uniqueDates[i];
        d.setHours(0,0,0,0);
        
        const diff = (checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
          checkDate = d;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          checkDate = d;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { currentStreak, longestStreak };
  }
}
export default CalculationService;
