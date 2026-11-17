import express from 'express';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';

const router = express.Router();

// Public: shows top 10 users with lowest total emissions (gamified goal)
router.get('/', async (req, res, next) => {
  try {
    const agg = await Activity.aggregate([
      { $group: { _id: '$userId', totalKg: { $sum: '$kgCO2e' } } },
      { $sort: { totalKg: 1 } },
      { $limit: 10 }
    ]);

    const userIds = agg.map(a => a._id);
    const users = await User.find({ _id: { $in: userIds } }, { username: 1, name: 1 }).lean();

    // Map user IDs to display names (prefers real name if available)
    const userMap = new Map(users.map(u => [String(u._id), u.name || u.username]));

    // Build leaderboard array with username and rounded total emissions
    const leaderboard = agg.map(a => ({
      username: userMap.get(String(a._id)) || 'Eco Participant',
      totalKg: Math.round(a.totalKg * 100) / 100
    }));

    res.json({ leaderboard });
  } catch (e) {
    next(e);
  }
});

export default router;
