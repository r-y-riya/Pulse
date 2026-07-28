import { Schema, model } from 'mongoose';

const AIReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['weekly', 'monthly'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  metrics: {
    totalVolume: { type: Number },
    workoutsCompleted: { type: Number },
    consistencyScore: { type: Number },
    recoveryAverage: { type: Number },
    plateausDetected: [{ type: String }],
    muscleImbalances: [{ type: String }]
  },
  content: { type: String, required: true }, // Markdown insights
  generatedAt: { type: Date, default: Date.now }
});

export const AIReport = model('AIReport', AIReportSchema);
export default AIReport;
