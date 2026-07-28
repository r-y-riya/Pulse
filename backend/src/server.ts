import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateStartup } from './config/startupValidation';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import healthRoutes from './routes/healthRoutes';
import cycleRoutes from './routes/cycleRoutes';
import aiRoutes from './routes/aiRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import Exercise from './models/Exercise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/ai', aiRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: "Momentum AI API is running..." });
});

// Error handling middleware
app.use(errorHandler);

// Bootstrap Server
const startServer = async () => {
  // 1. Run startup validation (Env, MongoDB connection, and Gemini API)
  await validateStartup();

  // 2. Auto-seed exercises if the library is empty
  try {
    const exerciseCount = await Exercise.countDocuments();
    if (exerciseCount === 0) {
      console.log("No exercises found in DB. Auto-seeding initial exercise library...");
      const { seedDB } = require('./utils/seedExercises');
      await seedDB(false); // Pass false so it does not close the connection
    }
  } catch (err) {
    console.error("Failed to seed exercises on startup:", err);
  }

  // 3. Start listening
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
