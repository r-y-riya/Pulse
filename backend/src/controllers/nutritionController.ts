import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import NutritionLog from '../models/NutritionLog';
import User from '../models/User';
import AIService from '../services/aiService';

export const logNutrition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, meal, water } = req.body;
    const userId = req.user?.id;

    let log = await NutritionLog.findOne({ userId, date });
    if (!log) {
      log = new NutritionLog({ userId, date, meals: [], waterIntake: 0 });
    }

    if (meal) {
      log.meals.push(meal);
    }
    if (water) {
      log.waterIntake += water;
    }

    await log.save();
    res.json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNutritionLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;

    const log = await NutritionLog.findOne({ userId, date });
    if (!log) {
      return res.json({
        date,
        meals: [],
        waterIntake: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });
    }
    res.json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMeal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, mealId } = req.params;
    const userId = req.user?.id;

    const log = await NutritionLog.findOne({ userId, date });
    if (!log) return res.status(404).json({ message: 'Log not found' });

    (log.meals as any).pull({ _id: mealId });
    await log.save();

    res.json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateAIMealPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const age = user.profile?.age || 25;
    const weight = user.profile?.weight || 70;
    const height = user.profile?.height || 175;
    const gender = user.profile?.gender || 'male';
    const activity = user.profile?.activityLevel || 'moderately_active';
    const goalType = user.profile?.workoutPreference || 'hypertrophy';

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const multipliers: { [key: string]: number } = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    const multiplier = multipliers[activity] || 1.55;
    const tdee = bmr * multiplier;

    let dailyCalories = tdee;
    if (goalType === 'strength' || goalType === 'hypertrophy') {
      dailyCalories += 300;
    } else if (goalType === 'cardio' || goalType === 'hiit') {
      dailyCalories -= 400;
    }

    dailyCalories = Math.round(dailyCalories);

    const proteinGrams = Math.round(weight * 2.0);
    const proteinKcal = proteinGrams * 4;
    const fatKcal = dailyCalories * 0.25;
    const fatGrams = Math.round(fatKcal / 9);
    const carbsKcal = dailyCalories - (proteinKcal + fatKcal);
    const carbsGrams = Math.max(50, Math.round(carbsKcal / 4));

    user.macroTargets = {
      calories: dailyCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    };

    await user.save();

    const mealPlan = await AIService.generateMealPlan({
      calories: dailyCalories,
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      preferences: user.profile?.workoutPreference || 'balanced diet',
      allergies: user.profile?.injuries || []
    });

    res.json({
      targets: {
        calories: dailyCalories,
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
      },
      ...mealPlan
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
