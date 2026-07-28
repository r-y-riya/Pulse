import { Schema, model } from 'mongoose';

const NutritionLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Formatted as YYYY-MM-DD
  meals: [{
    type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }],
  waterIntake: { type: Number, default: 0 }, // in ml
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 }
});

// Update totals pre-save
NutritionLogSchema.pre('save', function(next) {
  let cal = 0, pro = 0, carb = 0, fat = 0;
  this.meals.forEach(m => {
    cal += m.calories || 0;
    pro += m.protein || 0;
    carb += m.carbs || 0;
    fat += m.fat || 0;
  });
  this.totalCalories = cal;
  this.totalProtein = pro;
  this.totalCarbs = carb;
  this.totalFat = fat;
  next();
});

export const NutritionLog = model('NutritionLog', NutritionLogSchema);
export default NutritionLog;
