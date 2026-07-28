import { Schema, model } from 'mongoose';

const AchievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { 
    type: String, 
    enum: ['streak_7', 'streak_30', 'workouts_100', 'first_pr', 'volume_10000', 'consistency_king'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now }
});

// Ensure a user can only unlock each badge once
AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const Achievement = model('Achievement', AchievementSchema);
export default Achievement;
