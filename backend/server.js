import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongo } from './src/db/mongo.js';
import authRouter from './src/routes/auth.js';
import activitiesRouter from './src/routes/activities.js';
import suggestionsRouter from './src/routes/suggestions.js';
import leaderboardRouter from './src/routes/leaderboard.js';
import debugRouter from './src/routes/debug.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'carbon-footprint-tracker-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Debug routes only available outside production
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRouter);
  console.log('Debug routes enabled (NODE_ENV is not "production")');
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function start() {
  try {
    if (!MONGO_URI) {
      console.warn('MONGO_URI not set; running without database. Set MONGO_URI in .env to enable MongoDB.');
    } else {
      await connectMongo(MONGO_URI);
      console.log('Connected to MongoDB');
    }
  } catch (e) {
    console.error('MongoDB connection failed:', e.message);
  }
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start();
