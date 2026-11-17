import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { User } from './src/models/User.js';
import { Activity } from './src/models/Activity.js';
import { calculateActivityEmission } from './src/lib/calc.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carbon_tracker';

const DEFAULT_PASSWORD = 'password123';

// Generate recent dates helper
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const SAMPLE_USERS = [
  {
    username: 'demo',
    name: 'Aditya Sen',
    goals: { monthlyReductionKg: 20 },
    streak: { current: 6, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'eco-explorer', label: 'Eco Explorer 🌍' },
      { id: 'green-commuter', label: 'Green Commuter 🚌' }
    ],
    activities: [
      { type: 'transport', subtype: 'train_km', amount: 20, date: daysAgo(0), note: 'Delhi Metro to CyberHub' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Dal makhani & roti' },
      { type: 'electricity', subtype: 'kwh', amount: 6, date: daysAgo(1), note: 'Apartment fans & laptop' },
      { type: 'transport', subtype: 'bus_km', amount: 15, date: daysAgo(1), note: 'Electric city bus' },
      { type: 'food', subtype: 'chicken_meal', amount: 1, date: daysAgo(2), note: 'Dinner with colleagues' },
      { type: 'water', subtype: 'liters', amount: 120, date: daysAgo(2), note: 'Bucket bath & routine water' },
      { type: 'transport', subtype: 'train_km', amount: 30, date: daysAgo(3), note: 'Local suburban train' },
      { type: 'waste', subtype: 'bag_kg', amount: 4, date: daysAgo(4), note: 'Weekly household waste' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 1, date: daysAgo(5), note: 'Poha & ginger chai' },
      { type: 'electricity', subtype: 'kwh', amount: 8, date: daysAgo(5), note: 'Home office AC usage' },
      { type: 'transport', subtype: 'bus_km', amount: 12, date: daysAgo(6), note: 'DTC bus ride' },
      { type: 'shopping', subtype: 'clothing_item', amount: 1, date: daysAgo(8), note: 'Khadi cotton kurta' },
      { type: 'transport', subtype: 'car_km', amount: 18, date: daysAgo(10), note: 'Carpool cab ride' }
    ]
  },
  {
    username: 'aarav_sharma',
    name: 'Aarav Sharma',
    goals: { monthlyReductionKg: 15 },
    streak: { current: 14, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'eco-explorer', label: 'Eco Explorer 🌍' },
      { id: 'green-commuter', label: 'Green Commuter 🚌' },
      { id: 'streak-7', label: '7-Day Streak 🔥' }
    ],
    activities: [
      { type: 'transport', subtype: 'train_km', amount: 18, date: daysAgo(0), note: 'Metro rail commute' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Homecooked idli sambar' },
      { type: 'electricity', subtype: 'kwh', amount: 3.5, date: daysAgo(1), note: 'Solar powered home' },
      { type: 'transport', subtype: 'bus_km', amount: 8, date: daysAgo(1), note: 'CNG feeder bus' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 3, date: daysAgo(2), note: '100% vegetarian day' },
      { type: 'waste', subtype: 'bag_kg', amount: 1.5, date: daysAgo(3), note: 'Home composting' },
      { type: 'water', subtype: 'liters', amount: 80, date: daysAgo(4), note: 'Low-flow aeration tap' },
      { type: 'transport', subtype: 'train_km', amount: 25, date: daysAgo(5), note: 'Metro trip' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(6), note: 'Rajma chawal lunch' },
      { type: 'electricity', subtype: 'kwh', amount: 4, date: daysAgo(7), note: 'BEE 5-star appliances' },
      { type: 'transport', subtype: 'train_km', amount: 20, date: daysAgo(8), note: 'Local train' },
      { type: 'food', subtype: 'dairy_serving', amount: 1, date: daysAgo(9), note: 'Fresh paneer snack' }
    ]
  },
  {
    username: 'priya_patel',
    name: 'Priya Patel',
    goals: { monthlyReductionKg: 20 },
    streak: { current: 8, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'green-commuter', label: 'Green Commuter 🚌' },
      { id: 'streak-7', label: '7-Day Streak 🔥' }
    ],
    activities: [
      { type: 'transport', subtype: 'bus_km', amount: 25, date: daysAgo(0), note: 'BRTS bus to SG Highway' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Gujarati thali' },
      { type: 'transport', subtype: 'bus_km', amount: 22, date: daysAgo(1), note: 'Electric bus commute' },
      { type: 'electricity', subtype: 'kwh', amount: 7, date: daysAgo(2), note: 'LED lights & fan' },
      { type: 'transport', subtype: 'bus_km', amount: 20, date: daysAgo(3), note: 'Campus shuttle bus' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(4), note: 'Khichdi & curd' },
      { type: 'water', subtype: 'liters', amount: 140, date: daysAgo(5), note: 'Domestic water usage' },
      { type: 'transport', subtype: 'train_km', amount: 35, date: daysAgo(6), note: 'Vande Bharat express' },
      { type: 'waste', subtype: 'bag_kg', amount: 3, date: daysAgo(7), note: 'Recyclable dry waste' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 1, date: daysAgo(8), note: 'Sprouts & fruit bowl' }
    ]
  },
  {
    username: 'rohan_verma',
    name: 'Rohan Verma',
    goals: { monthlyReductionKg: 18 },
    streak: { current: 9, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'green-commuter', label: 'Green Commuter 🚌' },
      { id: 'streak-7', label: '7-Day Streak 🔥' }
    ],
    activities: [
      { type: 'transport', subtype: 'train_km', amount: 30, date: daysAgo(0), note: 'Mumbai Local Train' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Upma & vegetable curry' },
      { type: 'electricity', subtype: 'kwh', amount: 5, date: daysAgo(1), note: 'Laptop and fan' },
      { type: 'transport', subtype: 'bus_km', amount: 12, date: daysAgo(2), note: 'BEST electric bus' },
      { type: 'food', subtype: 'chicken_meal', amount: 1, date: daysAgo(3), note: 'Sunday chicken thali' },
      { type: 'water', subtype: 'liters', amount: 110, date: daysAgo(4), note: 'Shower & cleaning' },
      { type: 'transport', subtype: 'train_km', amount: 28, date: daysAgo(5), note: 'Western line commute' },
      { type: 'waste', subtype: 'bag_kg', amount: 2.5, date: daysAgo(6), note: 'Segregated waste' },
      { type: 'electricity', subtype: 'kwh', amount: 6, date: daysAgo(7), note: 'Evening lighting' }
    ]
  },
  {
    username: 'ananya_iyer',
    name: 'Ananya Iyer',
    goals: { monthlyReductionKg: 15 },
    streak: { current: 5, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'eco-explorer', label: 'Eco Explorer 🌍' }
    ],
    activities: [
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Dosa & coconut chutney' },
      { type: 'transport', subtype: 'train_km', amount: 15, date: daysAgo(0), note: 'Namma Metro purple line' },
      { type: 'electricity', subtype: 'kwh', amount: 5, date: daysAgo(1), note: 'Lighting & desktop' },
      { type: 'water', subtype: 'liters', amount: 100, date: daysAgo(2), note: 'Daily water conservation' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 3, date: daysAgo(3), note: 'Curd rice & poriyal' },
      { type: 'transport', subtype: 'bus_km', amount: 14, date: daysAgo(4), note: 'BMTC bus' },
      { type: 'natural_gas', subtype: 'cubic_meter', amount: 3, date: daysAgo(5), note: 'PNG pipeline cooking' },
      { type: 'waste', subtype: 'bag_kg', amount: 2, date: daysAgo(6), note: 'Wet waste to compost' },
      { type: 'food', subtype: 'dairy_serving', amount: 2, date: daysAgo(7), note: 'Filter coffee' },
      { type: 'shopping', subtype: 'clothing_item', amount: 1, date: daysAgo(12), note: 'Cotton handloom saree' }
    ]
  },
  {
    username: 'vikram_malhotra',
    name: 'Vikram Malhotra',
    goals: { monthlyReductionKg: 25 },
    streak: { current: 4, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' }
    ],
    activities: [
      { type: 'electricity', subtype: 'kwh', amount: 12, date: daysAgo(0), note: 'Workstation & dual monitors' },
      { type: 'transport', subtype: 'car_km', amount: 28, date: daysAgo(1), note: 'Drive across town' },
      { type: 'food', subtype: 'chicken_meal', amount: 2, date: daysAgo(1), note: 'Tandoori chicken dinner' },
      { type: 'electricity', subtype: 'kwh', amount: 14, date: daysAgo(2), note: 'Living room inverter AC' },
      { type: 'food', subtype: 'dairy_serving', amount: 2, date: daysAgo(3), note: 'Lassi & sweets' },
      { type: 'transport', subtype: 'car_km', amount: 22, date: daysAgo(4), note: 'Drive to mall' },
      { type: 'waste', subtype: 'bag_kg', amount: 4, date: daysAgo(5), note: 'Packaging waste' },
      { type: 'shopping', subtype: 'electronics_item', amount: 1, date: daysAgo(9), note: 'Smart watch gadget' },
      { type: 'natural_gas', subtype: 'cubic_meter', amount: 5, date: daysAgo(11), note: 'Geyser & kitchen gas' }
    ]
  },
  {
    username: 'sneha_kulkarni',
    name: 'Sneha Kulkarni',
    goals: { monthlyReductionKg: 22 },
    streak: { current: 7, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' },
      { id: 'streak-7', label: '7-Day Streak 🔥' }
    ],
    activities: [
      { type: 'transport', subtype: 'bus_km', amount: 18, date: daysAgo(0), note: 'PMPML bus in Pune' },
      { type: 'food', subtype: 'vegetarian_meal', amount: 2, date: daysAgo(0), note: 'Pithla bhakri' },
      { type: 'electricity', subtype: 'kwh', amount: 9, date: daysAgo(1), note: 'Water heater & AC' },
      { type: 'transport', subtype: 'car_km', amount: 20, date: daysAgo(2), note: 'Cab to airport' },
      { type: 'food', subtype: 'chicken_meal', amount: 1, date: daysAgo(3), note: 'Chicken biryani' },
      { type: 'water', subtype: 'liters', amount: 150, date: daysAgo(4), note: 'Washing machine laundry' },
      { type: 'transport', subtype: 'bus_km', amount: 16, date: daysAgo(5), note: 'Office commute' },
      { type: 'waste', subtype: 'bag_kg', amount: 3, date: daysAgo(6), note: 'General waste' },
      { type: 'shopping', subtype: 'clothing_item', amount: 1, date: daysAgo(8), note: 'FabIndia apparel' }
    ]
  },
  {
    username: 'kabir_mehta',
    name: 'Kabir Mehta',
    goals: { monthlyReductionKg: 30 },
    streak: { current: 3, lastLogDate: new Date() },
    achievements: [
      { id: 'first-log', label: 'First Activity Logged 🌱' },
      { id: 'ten-logs', label: '10 Activities Logged 📊' }
    ],
    activities: [
      { type: 'transport', subtype: 'flight_km', amount: 350, date: daysAgo(1), note: 'IndiGo flight Delhi to Jaipur' },
      { type: 'electricity', subtype: 'kwh', amount: 10, date: daysAgo(1), note: 'Hotel room power' },
      { type: 'food', subtype: 'chicken_meal', amount: 2, date: daysAgo(2), note: 'Restaurant dinner' },
      { type: 'transport', subtype: 'train_km', amount: 45, date: daysAgo(2), note: 'Airport express train' },
      { type: 'transport', subtype: 'car_km', amount: 40, date: daysAgo(3), note: 'Ola cab ride' },
      { type: 'waste', subtype: 'bag_kg', amount: 3, date: daysAgo(4), note: 'Travel packaging' },
      { type: 'food', subtype: 'dairy_serving', amount: 2, date: daysAgo(5), note: 'Breakfast buffet' },
      { type: 'water', subtype: 'liters', amount: 180, date: daysAgo(6), note: 'Hotel shower & amenities' }
    ]
  }
];

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Clean old users that were test/placeholder names
  await User.deleteMany({ username: { $in: ['testuser123', 'sarah_eco', 'alex_commuter', 'elena_green', 'marcus_dev', 'priya_traveler'] } });
  
  // Clean all orphaned activities
  const allCurrentUsers = await User.find({}, { _id: 1 });
  await Activity.deleteMany({ userId: { $nin: allCurrentUsers.map(u => u._id) } });

  console.log('\n--- Seeding Users with Authentic Indian Names ---');

  for (const sample of SAMPLE_USERS) {
    let user = await User.findOne({ username: sample.username });
    if (!user) {
      user = await User.create({
        username: sample.username,
        name: sample.name,
        password: hashedPassword,
        achievements: sample.achievements,
        goals: sample.goals,
        streak: sample.streak
      });
      console.log(`Created user: ${sample.name} (@${sample.username})`);
    } else {
      user.name = sample.name;
      user.achievements = sample.achievements;
      user.goals = sample.goals;
      user.streak = sample.streak;
      user.password = hashedPassword;
      await user.save();
      console.log(`Updated user: ${sample.name} (@${sample.username})`);
    }

    // Clear old activities for this user
    await Activity.deleteMany({ userId: user._id });

    // Insert activities
    const actsToInsert = sample.activities.map(a => {
      const kgCO2e = calculateActivityEmission(a);
      return {
        userId: user._id,
        type: a.type,
        subtype: a.subtype,
        amount: a.amount,
        date: a.date,
        kgCO2e,
        note: a.note || ''
      };
    });

    await Activity.insertMany(actsToInsert);
    const totalEmitted = actsToInsert.reduce((sum, item) => sum + item.kgCO2e, 0);
    console.log(`  -> Inserted ${actsToInsert.length} activities (Total: ${totalEmitted.toFixed(2)} kg CO₂e)`);
  }

  console.log('\n=== Seeding Finished Successfully! ===');
  console.log(`All users can sign in with password: "${DEFAULT_PASSWORD}"`);
  console.log('Leaderboard Participants:');
  SAMPLE_USERS.forEach((u, i) => console.log(`  ${i + 1}. ${u.name} (@${u.username})`));

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
