import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ai', 'streak', 'achievement', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = model('Notification', NotificationSchema);
export default Notification;
