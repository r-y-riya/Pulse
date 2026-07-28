import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import HealthMetric from '../models/HealthMetric';
import { Types } from 'mongoose';

export const calculateHealthMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { weight, height, age, gender, waist } = req.body;

    const w = weight || user.profile?.weight || 70;
    const h = height || user.profile?.height || 175;
    const a = age || user.profile?.age || 25;
    const g = gender || user.profile?.gender || 'male';

    const heightInM = h / 100;
    const bmi = parseFloat((w / (heightInM * heightInM)).toFixed(1));

    let bmiCategory = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 18.5 && bmi < 25) bmiCategory = 'Normal';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    const genderFactor = g === 'male' ? 1 : 0;
    const bodyFatEstimate = parseFloat(((1.20 * bmi) + (0.23 * a) - (10.8 * genderFactor) - 5.4).toFixed(1));

    const idealMin = parseFloat((18.5 * (heightInM * heightInM)).toFixed(1));
    const idealMax = parseFloat((24.9 * (heightInM * heightInM)).toFixed(1));

    const dailyWaterTarget = w * 35;

    const metricData = {
      _id: new Types.ObjectId().toString(),
      userId: user._id || user.id,
      date: new Date().toISOString(),
      weight: w,
      height: h,
      waist,
      bmi,
      bmiCategory,
      bodyFatEstimate,
      dailyCalorieTarget: user.macroTargets?.calories || 2000,
      dailyProteinTarget: user.macroTargets?.protein || 140,
      dailyWaterTarget
    };

    const metric = new HealthMetric(metricData);
    await metric.save();

    // Update user profile weight/height/age/gender in MongoDB
    if (user.profile) {
      user.profile.weight = w;
      user.profile.height = h;
      user.profile.age = a;
      user.profile.gender = g;
      await user.save();
    }

    const tips: { [key: string]: string[] } = {
      Underweight: [
        "Focus on a caloric surplus of 300-500 kcal by adding nutrient-dense healthy fats.",
        "Prioritize compound strength movements (Squats, Presses) to stimulate muscle hypertrophy.",
        "Ensure protein intake stays at 2.0g/kg to supply amino acids for muscle tissue growth."
      ],
      Normal: [
        "Maintain progressive overload: focus on increasing sets or reps gradually.",
        "Balance cardiovascular endurance sessions with strength sessions to maintain low body fat.",
        "Stay consistent with hydration: Drink at least 3 liters of water daily."
      ],
      Overweight: [
        "Implement a moderate calorie deficit (300-500 kcal below TDEE) to encourage fat oxidation.",
        "Add 2-3 HIIT or LISS cardio sessions weekly alongside your resistance training.",
        "Prioritize protein and high-fiber vegetables to boost satiety and retain muscle mass."
      ],
      Obese: [
        "Consult with a physician prior to heavy loading. Focus on low-impact exercise (walking, swimming).",
        "Gradually build up volume. Consistency beats intensity when establishing physical routines.",
        "Ensure carbohydrate intake focuses on complex, high-fiber grains instead of simple sugars."
      ]
    };

    res.json({
      bmi,
      bmiCategory,
      bodyFatEstimate: Math.max(3, bodyFatEstimate),
      idealRange: { min: idealMin, max: idealMax },
      waterTarget: dailyWaterTarget,
      tips: tips[bmiCategory] || tips['Normal']
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await HealthMetric.find({ userId: req.user?.id }).sort({ date: 1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
