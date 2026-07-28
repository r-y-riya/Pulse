import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Configure Node.js to use Google public DNS to reliably resolve MongoDB Atlas SRV records on Windows systems
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('Warning: Could not set DNS servers explicitly. Proceeding with system defaults.');
}

export const validateStartup = async () => {
  console.log('--- STARTUP VALIDATION ---');
  
  // 1. Validate environment variables
  const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'GEMINI_API_KEY'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  
  if (missingEnv.length > 0) {
    console.error(`FATAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
  }
  
  console.log('Environment variables validated.');

  // 2. Validate MongoDB connection
  const mongoUri = process.env.MONGODB_URI!;
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connection verified.');
  } catch (error: any) {
    console.error(`FATAL STARTUP ERROR: Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  // 3. Validate Gemini API availability
  const apiKey = process.env.GEMINI_API_KEY!;
  try {
    console.log('Verifying Gemini API key and availability...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Send a minimal request to ensure the key is valid and the API is responsive
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
      generationConfig: { maxOutputTokens: 5 }
    });
    
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Received empty response from Gemini API');
    }
    console.log('Gemini API verified successfully.');
  } catch (error: any) {
    console.error(`FATAL STARTUP ERROR: Gemini API key is missing or invalid: ${error.message}`);
    process.exit(1);
  }
  
  console.log('--- STARTUP VALIDATION PASSED ---');
};
