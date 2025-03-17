import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set mongoose options
mongoose.set('strictQuery', false);

const connectToMongoDB = async () => {
  const ATLAS_URI = process.env.ATLAS_URI;
  
  if (!ATLAS_URI) {
    console.error('ATLAS_URI environment variable not set!');
    process.exit(1);
  }

  try {
    // Configure mongoose connection
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };

    await mongoose.connect(ATLAS_URI, options);
    console.log('Connected to MongoDB Atlas.');
    
    // Set up connection error handler
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

export default connectToMongoDB;