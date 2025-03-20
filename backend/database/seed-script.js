import client, { connectDatabase } from './index.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
console.log('Starting seed script...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read and execute SQL file
const executeSqlFile = async (filename) => {
  try {
    console.log(`Executing ${filename}...`);
    const filePath = path.join(__dirname, 'seed-data', filename);
    const sql = await fs.readFile(filePath, 'utf8');
    await client.query(sql);
    console.log(`${filename} executed successfully!`);
  } catch (error) {
    console.error(`Error executing ${filename}:`, error);
    throw error;
  }
};

// Main function to run all seed operations
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Create tables from schema
    console.log('Creating tables from schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Tables created successfully!');
    
    // Disable foreign key constraints
    await client.query('SET session_replication_role = replica;');
    
    // Seed tables in order
    const seedFiles = [
      'courses_03192025.sql',
      'curriculums_courses_03192025.sql',
      'curriculums_structures_03192025.sql',
      'curriculums_03192025.sql',
      'programs_03192025.sql'
    ];
    
    for (const file of seedFiles) {
      await executeSqlFile(file);
    }
    
    // Re-enable foreign key constraints
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log('Database seeding completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await client.end();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();