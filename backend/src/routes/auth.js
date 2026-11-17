import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in environment variables');

const SALT_ROUNDS = 12;

// ─── Register ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });
    if (username.length < 3 || username.length > 32)
      return res.status(400).json({ error: 'Username must be 3–32 characters' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ username }).lean();
    if (existing) return res.status(409).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ username, password: hashedPassword, achievements: [], goals: { monthlyReductionKg: 10 }, streak: { current: 0, lastLogDate: null } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ─── Login ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    const user = await User.findOne({
      $or: [{ username }, { name: username }]
    }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (e) { next(e); }
});

// ─── Get Current User ───────────────────────────────────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ username: payload.sub }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      name: user.name || user.username,
      achievements: user.achievements || [],
      goals: user.goals || { monthlyReductionKg: 10 },
      streak: user.streak || { current: 0, lastLogDate: null }
    });
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Invalid or expired token' });
    next(e);
  }
});

// ─── Update Monthly Goal ────────────────────────────────────────────────────
router.put('/goal', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    const { monthlyReductionKg } = req.body;
    const val = Number(monthlyReductionKg);
    if (isNaN(val) || val <= 0)
      return res.status(400).json({ error: 'monthlyReductionKg must be a positive number' });

    await User.updateOne({ username: payload.sub }, { 'goals.monthlyReductionKg': val });
    res.json({ success: true, monthlyReductionKg: val });
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Invalid or expired token' });
    next(e);
  }
});

// ─── Change Password ────────────────────────────────────────────────────────
router.put('/password', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findOne({ username: payload.sub });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
    res.json({ success: true });
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Invalid or expired token' });
    next(e);
  }
});

export default router;
