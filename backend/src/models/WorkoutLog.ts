import { Schema, model } from 'mongoose';

const WorkoutLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g. "Push Protocol", "Upper Body Power"
  exercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    name: { type: String, required: true },
    category: { type: String },
    sets: [{
      weight: { type: Number, required: true },
      reps: { type: Number, required: true },
      rpe: { type: Number, min: 1, max: 10, default: 8 },
      completed: { type: Boolean, default: true }
    }]
  }],
  duration: { type: Number, required: true }, // in minutes
  calories: { type: Number, default: 0 },
  mood: { type: Number, min: 1, max: 5, default: 3 }, // 1 (poor) to 5 (excellent)
  energy: { type: Number, min: 1, max: 5, default: 3 }, // 1 (low) to 5 (high)
  soreness: { type: Number, min: 1, max: 5, default: 2 }, // 1 (none) to 5 (extreme)
  sleepHours: { type: Number, default: 8 },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

export const WorkoutLog = model('WorkoutLog', WorkoutLogSchema);
export default WorkoutLog;
