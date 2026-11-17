import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type:    { type: String, required: true },
  subtype:    { type: String, required: true },
  amount:     { type: Number, required: true },
  deviceType: { type: String, default: null }, // Electronic device type: Smartphone, Tablet, Laptop, Desktop PC, Monitor, Other
  date:       { type: Date, default: Date.now },
  kgCO2e: { type: Number, required: true },
  note:    { type: String, default: '' }  // optional user note per activity
}, { timestamps: true });

export const Activity = mongoose.model('Activity', ActivitySchema);
