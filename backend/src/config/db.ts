import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }
  
  // If already connected, reuse the connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  console.log(`Connecting to MongoDB...`);
  const conn = await mongoose.connect(connStr, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
