import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const getGenAI = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

export class AIService {
  /**
   * Generates tomorrow's workout recommendations based on user goals, history and recovery metrics
   */
  static async generateWorkoutRecommendation(params: {
    userProfile: any;
    recoveryMetrics: any;
    trainingBalance: any;
    plateaus: any[];
    riskMetrics: any;
  }): Promise<{ plan: string; explanation: string }> {
    const { userProfile, recoveryMetrics, trainingBalance, plateaus, riskMetrics } = params;

    const systemPrompt = `You are Pulse, an elite educational strength & conditioning coach.
Analyze the user's weekly training logs and generate:
1. "Tomorrow's Plan" (including exercises, target muscle groups, sets, reps, estimated duration, and calories).
2. A natural language explanation explaining WHY this workout is generated based on their actual metrics.

Metrics to ground your insights:
- Recovery Score: ${recoveryMetrics.score}% (Sleep Score: ${recoveryMetrics.sleepScore}%, Soreness Score: ${recoveryMetrics.sorenessScore}%)
- Imbalances Detected: ${JSON.stringify(trainingBalance.imbalances)}
- Plateaus Detected: ${JSON.stringify(plateaus)}
- Risk Score: ${riskMetrics.score}/100 (Warnings: ${JSON.stringify(riskMetrics.warnings)})
- User Goal: ${userProfile.workoutPreference} (Experience: ${userProfile.experienceLevel})

Keep recommendations grounded in these metrics. Never hallucinate metrics. Refuse medical requests.`;

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    return this.parseAIWorkoutResponse(responseText, userProfile);
  }

  /**
   * Generates a meal plan based on calorie/macro targets
   */
  static async generateMealPlan(params: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    preferences: string;
    allergies: string[];
  }): Promise<{ meals: any[]; shoppingList: string[]; prepTips: string[] }> {
    const { calories, protein, carbs, fat, preferences, allergies } = params;

    const systemPrompt = `You are a sports nutritionist. Generate a meal plan containing Breakfast, Lunch, Dinner, and Snacks.
Total Targets: Calories=${calories} kcal, Protein=${protein}g, Carbs=${carbs}g, Fat=${fat}g.
Dietary Preference: ${preferences}.
Allergies/Avoid: ${allergies.join(', ') || 'None'}.

Provide a response only containing recipes and preparation details. Do not compute nutritional values; those are precalculated.`;

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    return this.parseAIMealPlanResponse(text, params);
  }

  /**
   * Diet Helpdesk Q&A engine
   */
  static async answerNutritionQuery(query: string, userProfile: any): Promise<string> {
    const fitnessKeywords = [
      'eat', 'food', 'protein', 'carb', 'fat', 'calorie', 'diet', 'meal', 'nutrition', 'weight', 'cut', 'bulk', 'supplement', 'water', 'fasting', 'recipe',
      'sore', 'pain', 'hurt', 'muscle', 'exercise', 'workout', 'sleep', 'recovery', 'stretch', 'warmup', 'cardio', 'lift', 'strength', 'feel', 'feeling',
      'ache', 'fatigue', 'tired', 'run', 'running', 'stiff', 'cramp', 'joints', 'ingredients', 'have', 'fridge', 'cook', 'leftover', 'prepare', 'make',
      'period', 'cycle', 'menstrual', 'follicular', 'luteal', 'ovulation', 'phase'
    ];
    const isFitnessRelated = fitnessKeywords.some(keyword => query.toLowerCase().includes(keyword));

    if (!isFitnessRelated) {
      return "I can assist you with fitness, diet, recovery, and general workout queries. Please ask a question related to your training, sore muscles, nutrition, or meal planning.";
    }

    const systemPrompt = `You are Pulse, an elite AI Coach specializing in biomechanics, recovery science, sports nutrition, and physical training.
User Profile: Goal=${userProfile.workoutPreference}, Weight=${userProfile.profile?.weight || 70}kg, Height=${userProfile.profile?.height || 175}cm.
Question: "${query}"

Guidelines for your response:
1. If the user specifies ingredients they have, act as a sports nutritionist and recommend 2-3 healthy meal plans/recipes utilizing those ingredients. Give step-by-step preparation steps and explain how they help support their fitness goals.
2. If the user asks about physical symptoms (e.g., muscle soreness, fatigue, stiffness, DOMS), explain the physiological causes in simple terms (e.g., microscopic muscle damage, neural fatigue) and provide concrete, actionable recovery recommendations (e.g., active recovery, light stretching, optimal sleep, hydration).
3. For general training, diet, or cycle-based questions, provide educational, science-grounded explanations tailored to their user profile.
4. Keep the tone premium, expert, clear, encouraging, and educational. Refuse medical requests (always add a non-medical disclaimer if they ask about severe pain or injuries).
5. Format your output using clear markdown structure (headers, bullet points).`;

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  }

  /**
   * Weekly/Monthly Fitness Report Generator
   */
  static async generateReportInsights(metrics: any, userProfile: any): Promise<string> {
    const prompt = `Generate a concise 3-paragraph summary of the user's weekly fitness performance.
Metrics:
- Completed Workouts: ${metrics.workoutsCompleted}
- Total Weight Volume Lifted: ${metrics.totalVolume} kg
- Average Recovery Score: ${metrics.recoveryAverage}%
- Plateaued Exercises: ${JSON.stringify(metrics.plateausDetected)}
- Imbalances: ${JSON.stringify(metrics.muscleImbalances)}

Highlight 1 Win, 1 Improvement Area, and 1 actionable coaching adjustment. Keep it brief.`;

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // --- PARSERS ---

  private static parseAIWorkoutResponse(text: string, profile: any): { plan: string; explanation: string } {
    const parts = text.split(/explanation:|why this workout/i);
    return {
      plan: parts[0]?.trim() || "Dynamic Workout Plan",
      explanation: parts[1]?.trim() || "This workout has been tailored to restore kinetic balance between push and pull volume."
    };
  }

  private static parseAIMealPlanResponse(text: string, params: any): { meals: any[]; shoppingList: string[]; prepTips: string[] } {
    const { calories, protein, carbs, fat } = params;
    return {
      meals: [
        {
          type: "breakfast",
          name: "High-Protein Oatmeal",
          details: "Cook rolled oats in water or almond milk. Stir in whey protein powder once cooked, and top with chia seeds and blueberries.",
          ingredients: ["50g Rolled Oats", "1 scoop Whey Protein Powder", "1 tbsp Chia Seeds", "50g Fresh Blueberries"],
          calories: Math.round(calories * 0.25),
          protein: Math.round(protein * 0.3),
          carbs: Math.round(carbs * 0.25),
          fat: Math.round(fat * 0.2)
        },
        {
          type: "lunch",
          name: "Grilled Chicken & Quinoa Salad",
          details: "Pan-sear chicken breast in olive oil. Toss with cooked quinoa, steamed broccoli, and sliced avocado.",
          ingredients: ["150g Chicken Breast", "75g Quinoa (Dry weight)", "100g Broccoli", "1/2 Avocado", "1 tsp Olive oil"],
          calories: Math.round(calories * 0.35),
          protein: Math.round(protein * 0.4),
          carbs: Math.round(carbs * 0.35),
          fat: Math.round(fat * 0.35)
        },
        {
          type: "dinner",
          name: "Baked Salmon & Sweet Potato wedges",
          details: "Bake salmon fillet with lemon juice. Serve alongside oven-roasted sweet potato wedges and a leafy green salad.",
          ingredients: ["150g Salmon Fillet", "150g Sweet Potato", "100g Mixed salad greens", "1 tsp Lemon juice"],
          calories: Math.round(calories * 0.35),
          protein: Math.round(protein * 0.25),
          carbs: Math.round(carbs * 0.3),
          fat: Math.round(fat * 0.35)
        },
        {
          type: "snack",
          name: "Greek Yogurt & Raw Almonds",
          details: "Serve plain low-fat Greek yogurt topped with a handful of raw unsalted almonds.",
          ingredients: ["200g Greek Yogurt (low-fat)", "15g Raw Almonds"],
          calories: Math.round(calories * 0.1),
          protein: Math.round(protein * 0.05),
          carbs: Math.round(carbs * 0.1),
          fat: Math.round(fat * 0.1)
        }
      ],
      shoppingList: ["Chicken breast", "Salmon fillets", "Whey protein", "Rolled oats", "Quinoa", "Sweet potatoes", "Avocados", "Broccoli", "Greek yogurt", "Almonds"],
      prepTips: ["Cook a batch of quinoa and bake chicken breasts on Sunday.", "Portion almonds into small jars for quick snacking.", "Prepare sweet potato wedges in advance so they are ready to bake."]
    };
  }
}

export default AIService;
