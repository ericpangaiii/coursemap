import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the client with connection string
const client = new Client({
  connectionString: process.env.SUPABASE_URI,
  ssl: process.env.SUPABASE_URI?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Separate function to connect to database
export const connectDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database on Supabase');
    return true;
  } catch (err) {
    console.error('Database connection error', err.stack);
    throw err;
  }
};

export default client;