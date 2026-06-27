import mongoose from 'mongoose';
import { setMongoConnected } from '../models/schemas.js';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI specified in environment. Fallback to Local JSON DB.');
    setMongoConnected(false);
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully!');
    setMongoConnected(true);
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.log('Falling back to Local JSON DB.');
    setMongoConnected(false);
    return false;
  }
};
