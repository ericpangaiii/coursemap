import mongoose from 'mongoose';
import dotenv from 'dotenv';

// load MongoDB Atlas URI from .env file
dotenv.config();

// function to connect to MongoDB Atlas
const connectToMongoDB = async () => {
  try {
    const ATLAS_URI = process.env.ATLAS_URI;
    await mongoose.connect(ATLAS_URI);

    console.log('Connected to MongoDB Atlas.');

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectToMongoDB;