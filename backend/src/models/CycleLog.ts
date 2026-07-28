import { Schema, model } from 'mongoose';

const CycleLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Null if period is ongoing
  cycleLength: { type: Number, default: 28 }, // Predicted or historical average
  periodLength: { type: Number, default: 5 },  // Predicted or historical average
  dailyLogs: [{
    date: { type: String, required: true }, // YYYY-MM-DD
    symptoms: [{ type: String }], // cramps, bloating, headache, etc.
    flow: { type: String, enum: ['light', 'medium', 'heavy', 'spotting', 'none'], default: 'none' },
    mood: { type: String, enum: ['calm', 'happy', 'anxious', 'irritable', 'sad', 'tired'], default: 'calm' },
    energy: { type: Number, min: 1, max: 5, default: 3 },
    painLevel: { type: Number, min: 0, max: 5, default: 0 }
  }]
});

export const CycleLog = model('CycleLog', CycleLogSchema);
export default CycleLog;
