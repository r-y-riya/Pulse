import { Schema, model } from 'mongoose';

const WorkoutPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 (Sunday) to 6 (Saturday) for recurring weekly plans
  date: { type: Date }, // Specific single session date if scheduled for a calendar day
  exercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    name: { type: String, required: true },
    category: { type: String },
    setsCount: { type: Number, default: 3 },
    repsRange: { type: String, default: '8-12' },
    targetRpe: { type: Number, default: 8 }
  }],
  notes: { type: String },
  estimatedDuration: { type: Number, default: 45 }, // in minutes
  estimatedCalories: { type: Number, default: 300 },
  isCompleted: { type: Boolean, default: false }
});

export const WorkoutPlan = model('WorkoutPlan', WorkoutPlanSchema);
export default WorkoutPlan;
