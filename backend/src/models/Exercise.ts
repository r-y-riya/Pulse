import { Schema, model } from 'mongoose';

const ExerciseSchema = new Schema({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['strength', 'hypertrophy', 'cardio', 'mobility', 'hiit'], 
    required: true 
  },
  bodyPart: { type: String, required: true }, // e.g. chest, back, legs, arms, shoulders, core
  equipment: { type: String, required: true }, // e.g. barbell, dumbbells, cables, machine, bodyweight
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  primaryMuscles: [{ type: String }],
  secondaryMuscles: [{ type: String }],
  instructions: [{ type: String }],
  commonMistakes: [{ type: String }],
  gifUrl: { type: String }
});

export const Exercise = model('Exercise', ExerciseSchema);
export default Exercise;
