import express from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';

const router = express.Router();

// WARNING: Debug-only endpoints. These are disabled in production (NODE_ENV=production).

// List all users (passwords masked)
router.get('/users', async (req, res, next) => {
  try {
    const list = await User.find({}, { username: 1, achievements: 1, goals: 1 }).lean();
    const masked = list.map(u => ({
      username: u.username,
      password: '***masked***',
      achievements: u.achievements || [],
      goals: u.goals || {}
    }));
    res.json({ users: masked });
  } catch (e) {
    next(e);
  }
});

// List all activities grouped by user
router.get('/activities', async (req, res, next) => {
  try {
    const users = await User.find({}, { username: 1 }).lean();
    const userMap = new Map(users.map(u => [String(u._id), u.username]));
    const acts = await Activity.find({}).lean();
    const grouped = new Map();
    for (const a of acts) {
      const uid = String(a.userId);
      if (!grouped.has(uid)) grouped.set(uid, []);
      grouped.get(uid).push(a);
    }
    const data = Array.from(grouped.entries()).map(([uid, list]) => ({
      username: userMap.get(uid) || uid,
      count: list.length,
      activities: list
    }));
    res.json({ users: data });
  } catch (e) {
    next(e);
  }
});

export default router;
