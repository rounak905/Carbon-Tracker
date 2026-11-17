import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';

const router = express.Router();

// Get personalized sustainability tips based on logged activities
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.username }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const list = await Activity.find({ userId: user._id }).lean();
    const tips = [];

    // Build a set of all activity type:subtype combinations the user has logged
    const used = new Set(list.map(a => `${a.type}:${a.subtype}`));

    // Transport tips
    if (used.has('transport:car_km')) {
      tips.push('Try public transport or carpool one day per week to cut transport emissions.');
    }
    if (used.has('transport:flight_km')) {
      tips.push('Flights are high-emission. Consider taking a train for shorter journeys.');
    }
    if (used.has('transport:bus_km') || used.has('transport:train_km')) {
      tips.push('Great job using low-emission transport! Keep it up.');
    }

    // Electricity tips
    if (used.has('electricity:kwh')) {
      tips.push('Switch to LED bulbs and unplug idle devices to reduce electricity usage.');
      tips.push('Consider using a smart power strip to automatically cut phantom loads.');
    }

    // Food tips
    if (used.has('food:chicken_meal')) {
      tips.push('Replacing one chicken meal per week with a plant-based option can cut food emissions significantly.');
    }
    if (used.has('food:dairy_serving')) {
      tips.push('Reducing dairy intake and switching to plant-based milk alternatives lowers your footprint.');
    }
    if (used.has('food:vegetarian_meal')) {
      tips.push('Excellent choice! Vegetarian meals have a much lower carbon footprint than meat-based meals.');
    }

    if (tips.length === 0) {
      tips.push('Great start! Keep logging activities to get personalised tips tailored to your habits.');
    }

    res.json({ tips });
  } catch (e) {
    next(e);
  }
});

export default router;
