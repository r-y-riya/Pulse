import { Schema, model } from 'mongoose';

const GoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['lose_fat', 'gain_muscle', 'maintain', 'strength', 'custom'], 
    required: true 
  },
  title: { type: String, required: true },
  targetWeight: { type: Number },
  targetCalories: { type: Number },
  targetWorkoutFrequency: { type: Number, default: 3 }, // workouts per week
  deadline: { type: Date },
  progressPercent: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const Goal = model('Goal', GoalSchema);
export default Goal;
