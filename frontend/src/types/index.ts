export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  workoutPreference: 'strength' | 'hypertrophy' | 'cardio' | 'mobility' | 'hiit';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  equipmentAvailable: string[];
  workoutDaysPerWeek: number;
  injuries: string[];
}

export interface UserSettings {
  theme: 'dark' | 'light';
  units: 'metric' | 'imperial';
  notifications: boolean;
  privacy: 'private' | 'public';
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  settings: UserSettings;
  macroTargets: MacroTargets;
}

export interface SetLog {
  _id?: string;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId?: string;
  name: string;
  category?: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  _id: string;
  name: string;
  exercises: ExerciseLog[];
  duration: number;
  calories: number;
  mood: number;
  energy: number;
  soreness: number;
  sleepHours: number;
  notes?: string;
  date: string;
}

export interface PlannedExercise {
  exerciseId?: string;
  name: string;
  category?: string;
  setsCount: number;
  repsRange: string;
  targetRpe: number;
}

export interface WorkoutPlan {
  _id: string;
  name: string;
  dayOfWeek?: number;
  date?: string;
  exercises: PlannedExercise[];
  notes?: string;
  estimatedDuration: number;
  estimatedCalories: number;
  isCompleted: boolean;
}

export interface Exercise {
  _id: string;
  name: string;
  category: 'strength' | 'hypertrophy' | 'cardio' | 'mobility' | 'hiit';
  bodyPart: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  commonMistakes: string[];
  gifUrl?: string;
}

export interface Goal {
  _id: string;
  type: 'lose_fat' | 'gain_muscle' | 'maintain' | 'strength' | 'custom';
  title: string;
  targetWeight?: number;
  targetCalories?: number;
  targetWorkoutFrequency: number;
  deadline?: string;
  progressPercent: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
}

export interface Meal {
  _id?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionLog {
  date: string;
  meals: Meal[];
  waterIntake: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DailyCycleLog {
  date: string;
  symptoms: string[];
  flow: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
  mood: 'calm' | 'happy' | 'anxious' | 'irritable' | 'sad' | 'tired';
  energy: number;
  painLevel: number;
}

export interface CycleAnalytics {
  hasData: boolean;
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  phase: 'menstruation' | 'follicular' | 'ovulation' | 'luteal';
  phaseTitle: string;
  recommendation: string;
  nextPeriod?: string;
  daysUntilNext: number;
  ovulationDate?: string;
  dailyLogs: DailyCycleLog[];
}

export interface Achievement {
  _id: string;
  badgeId: 'streak_7' | 'streak_30' | 'workouts_100' | 'first_pr' | 'volume_10000' | 'consistency_king';
  title: string;
  description: string;
  unlockedAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: 'ai' | 'streak' | 'achievement' | 'general';
  read: boolean;
  createdAt: string;
}

export interface Telemetry {
  recovery: {
    score: number;
    sleepScore: number;
    energyScore: number;
    sorenessScore: number;
    intensityScore: number;
  };
  balance: {
    push: number;
    pull: number;
    legs: number;
    core: number;
    cardio: number;
    mobility: number;
    imbalances: string[];
  };
  plateaus: {
    exerciseName: string;
    sessionsTested: number;
    isPlateaued: boolean;
    reason?: string;
  }[];
  risk: {
    score: number;
    warnings: string[];
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
}
