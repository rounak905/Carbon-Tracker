import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { calculateActivityEmission, totalEmissions, factors } from '../lib/calc.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';

const router = express.Router();

// Valid types and subtypes derived from emission factors
const VALID_SUBTYPES = Object.fromEntries(
  Object.entries(factors).map(([type, subs]) => [type, Object.keys(subs)])
);

// ─── Helper: award achievements & update streak ─────────────────────────────
async function updateStreak(user) {
  const today = new Date().toISOString().split('T')[0];
  const lastLog = user.streak?.lastLogDate
    ? new Date(user.streak.lastLogDate).toISOString().split('T')[0]
    : null;

  if (lastLog === today) return; // already logged today, no streak update

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = lastLog === yesterday ? (user.streak?.current || 0) + 1 : 1;
  user.streak = { current: newStreak, lastLogDate: new Date() };

  // Streak achievements
  if (newStreak >= 7 && !user.achievements?.some(a => a.id === 'streak-7')) {
    user.achievements = [...(user.achievements || []), { id: 'streak-7', label: '7-Day Streak 🔥' }];
  }
  if (newStreak >= 30 && !user.achievements?.some(a => a.id === 'streak-30')) {
    user.achievements = [...(user.achievements || []), { id: 'streak-30', label: '30-Day Streak 🌟' }];
  }
}

async function checkAchievements(user, allActivities) {
  const achievements = user.achievements || [];
  const newAchievements = [...achievements];
  let changed = false;

  // First log
  if (!newAchievements.some(a => a.id === 'first-log')) {
    newAchievements.push({ id: 'first-log', label: 'First Activity Logged 🌱' });
    changed = true;
  }
  // 10 activities
  if (allActivities.length >= 10 && !newAchievements.some(a => a.id === 'ten-logs')) {
    newAchievements.push({ id: 'ten-logs', label: '10 Activities Logged 📊' });
    changed = true;
  }
  // 50 activities
  if (allActivities.length >= 50 && !newAchievements.some(a => a.id === 'fifty-logs')) {
    newAchievements.push({ id: 'fifty-logs', label: '50 Activities Logged 🏅' });
    changed = true;
  }
  // Eco Explorer — logged all base types (transport, food, electricity)
  const types = new Set(allActivities.map(a => a.type));
  if (['transport', 'food', 'electricity'].every(t => types.has(t)) && !newAchievements.some(a => a.id === 'eco-explorer')) {
    newAchievements.push({ id: 'eco-explorer', label: 'Eco Explorer 🌍' });
    changed = true;
  }
  // Green Commuter — logged train or bus 5+ times
  const lowEmissionTransport = allActivities.filter(a => a.type === 'transport' && (a.subtype === 'train_km' || a.subtype === 'bus_km'));
  if (lowEmissionTransport.length >= 5 && !newAchievements.some(a => a.id === 'green-commuter')) {
    newAchievements.push({ id: 'green-commuter', label: 'Green Commuter 🚌' });
    changed = true;
  }

  if (changed) user.achievements = newAchievements;
  return changed;
}

// ─── GET all activities ─────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.username }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const list = await Activity.find({ userId: user._id }).sort({ date: 1 }).lean();
    res.json({ activities: list, totalKg: totalEmissions(list) });
  } catch (e) { next(e); }
});

// ─── POST new activity ──────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { type, subtype, amount, date, note, deviceType } = req.body;

    // Validation
    if (!type || !subtype || amount == null)
      return res.status(400).json({ error: 'type, subtype, and amount are required' });
    if (!VALID_SUBTYPES[type])
      return res.status(400).json({ error: `Invalid type. Must be one of: ${Object.keys(VALID_SUBTYPES).join(', ')}` });
    if (!VALID_SUBTYPES[type].includes(subtype))
      return res.status(400).json({ error: `Invalid subtype "${subtype}" for type "${type}"` });
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: 'amount must be a positive number' });

    const user = await User.findOne({ username: req.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let selectedDevice = null;
    if (type === 'shopping' && subtype === 'electronics_item') {
      selectedDevice = deviceType ? String(deviceType).trim() : 'Other';
    }

    const doc = await Activity.create({
      userId: user._id,
      type,
      subtype,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      kgCO2e: calculateActivityEmission({ type, subtype, amount: parsedAmount, deviceType: selectedDevice }),
      note: note || '',
      deviceType: selectedDevice
    });

    // Streak + achievements
    await updateStreak(user);
    const allActivities = await Activity.find({ userId: user._id }).lean();
    await checkAchievements(user, allActivities);
    await user.save();

    res.status(201).json(doc.toObject());
  } catch (e) { next(e); }
});

// ─── PUT edit activity ──────────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.username }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activity = await Activity.findOne({ _id: req.params.id, userId: user._id });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const { type, subtype, amount, date, note, deviceType } = req.body;

    // Only validate fields that are provided
    const newType = type || activity.type;
    const newSubtype = subtype || activity.subtype;
    const newAmount = amount != null ? Number(amount) : activity.amount;

    if (!VALID_SUBTYPES[newType])
      return res.status(400).json({ error: `Invalid type: ${newType}` });
    if (!VALID_SUBTYPES[newType].includes(newSubtype))
      return res.status(400).json({ error: `Invalid subtype "${newSubtype}" for type "${newType}"` });
    if (isNaN(newAmount) || newAmount <= 0)
      return res.status(400).json({ error: 'amount must be a positive number' });

    let newDeviceType = activity.deviceType;
    if (newType === 'shopping' && newSubtype === 'electronics_item') {
      if (deviceType !== undefined) {
        newDeviceType = deviceType ? String(deviceType).trim() : 'Other';
      } else if (!newDeviceType) {
        newDeviceType = 'Other';
      }
    } else if (deviceType !== undefined) {
      newDeviceType = deviceType ? String(deviceType).trim() : null;
    }

    activity.type = newType;
    activity.subtype = newSubtype;
    activity.amount = newAmount;
    activity.deviceType = newDeviceType;
    activity.kgCO2e = calculateActivityEmission({
      type: newType,
      subtype: newSubtype,
      amount: newAmount,
      deviceType: newDeviceType
    });
    if (date) activity.date = new Date(date);
    if (note !== undefined) activity.note = note;

    await activity.save();
    res.json(activity.toObject());
  } catch (e) { next(e); }
});

// ─── DELETE activity ────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.username }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const found = await Activity.findOne({ _id: req.params.id, userId: user._id }).lean();
    if (!found) return res.status(404).json({ error: 'Activity not found' });
    await Activity.deleteOne({ _id: req.params.id, userId: user._id });
    res.json(found);
  } catch (e) { next(e); }
});

export default router;
