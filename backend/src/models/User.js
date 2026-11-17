import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, index: true },
  name: { type: String, default: '' },
  password: { type: String, required: true }, // stored as bcryptjs hash
  achievements: [{ id: String, label: String }],
  goals: {
    monthlyReductionKg: { type: Number, default: 10 }
  },
  // Streak tracking: consecutive days with at least one logged activity
  streak: {
    current: { type: Number, default: 0 },
    lastLogDate: { type: Date, default: null }
  }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
