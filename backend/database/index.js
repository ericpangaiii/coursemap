import pkg from 'pg';
const { Pool } = pkg;  // Change this line to use Pool instead of Client
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the pool with connection string
const pool = new Pool({
  connectionString: process.env.SUPABASE_URI,
  ssl: process.env.SUPABASE_URI?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Function to connect to the database
export const connectDatabase = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('Connected to PostgreSQL database on Supabase');
    return true;
  } catch (err) {
    console.error('Database connection error', err.stack);
    throw err;
  }
};

export default pool;  // Export the pool instead of client