import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profile: {
    age: { type: Number, default: 25 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    weight: { type: Number, default: 70 }, // in kg
    height: { type: Number, default: 175 }, // in cm
    activityLevel: { 
      type: String, 
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'], 
      default: 'moderately_active' 
    },
    workoutPreference: { 
      type: String, 
      enum: ['strength', 'hypertrophy', 'cardio', 'mobility', 'hiit'], 
      default: 'hypertrophy' 
    },
    experienceLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'], 
      default: 'intermediate' 
    },
    equipmentAvailable: [{ type: String, default: ['bodyweight', 'dumbbells', 'barbell', 'cables', 'machines'] }],
    workoutDaysPerWeek: { type: Number, default: 4 },
    injuries: [{ type: String }],
  },
  settings: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    notifications: { type: Boolean, default: true },
    privacy: { type: String, enum: ['private', 'public'], default: 'private' }
  },
  macroTargets: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 140 }, // in grams
    carbs: { type: Number, default: 220 }, // in grams
    fat: { type: Number, default: 60 } // in grams
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = model('User', UserSchema);
export default User;
