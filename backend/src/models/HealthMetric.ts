import { Schema, model } from 'mongoose';

const HealthMetricSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true }, // in kg
  height: { type: Number, required: true }, // in cm
  waist: { type: Number }, // in cm
  bmi: { type: Number, required: true },
  bmiCategory: { type: String, required: true },
  bodyFatEstimate: { type: Number }, // percentage
  dailyCalorieTarget: { type: Number },
  dailyProteinTarget: { type: Number },
  dailyWaterTarget: { type: Number } // in ml
});

export const HealthMetric = model('HealthMetric', HealthMetricSchema);
export default HealthMetric;
