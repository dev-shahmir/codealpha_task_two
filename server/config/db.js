import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[VYBEBOARD] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('[VYBEBOARD] MongoDB connection error:', err.message);
    process.exit(1);
  }
}
