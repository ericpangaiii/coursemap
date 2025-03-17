import mongoose from 'mongoose';
import Program from './models/program.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Sample program data
const programs = [
  { code: 'BACA', name: 'BA Communication Arts', description: 'Study of communication theories and practices' },
  { code: 'BAPH', name: 'BA Philosophy', description: 'Study of fundamental questions about existence, knowledge, and ethics' },
  { code: 'BASO', name: 'BA Sociology', description: 'Study of human society and social behavior' },
  { code: 'BSACC', name: 'BS Accountancy', description: 'Study of accounting principles and practices' },
  { code: 'BSMATE', name: 'BS Materials Engineering', description: 'Study of materials and their applications' },
  { code: 'BSMECH', name: 'BS Mechanical Engineering', description: 'Study of mechanical systems and principles' },
  { code: 'BSAME', name: 'BS Agribusiness Management and Entrepreneurship', description: 'Study of agricultural business management' },
  { code: 'BSAAE', name: 'BS Agricultural and Applied Economics', description: 'Study of economics applied to agriculture' },
  { code: 'BSABE', name: 'BS Agricultural and Biosystems Engineering', description: 'Study of engineering applied to agricultural systems' },
  { code: 'BSAB', name: 'BS Agricultural Biotechnology', description: 'Study of biotechnology applied to agriculture' },
  { code: 'BSACH', name: 'BS Agricultural Chemistry', description: 'Study of chemistry applied to agriculture' },
  { code: 'BSAE', name: 'BS Agricultural Economics', description: 'Study of economics in agricultural contexts' },
  { code: 'BSA', name: 'BS Agriculture', description: 'Study of agricultural principles and practices' },
  { code: 'BSAM', name: 'BS Applied Mathematics', description: 'Study of mathematics applied to real-world problems' },
  { code: 'BSAP', name: 'BS Applied Physics', description: 'Study of physics applied to practical situations' },
  { code: 'BSB', name: 'BS Biology', description: 'Study of living organisms and life processes' },
  { code: 'BSCHE', name: 'BS Chemical Engineering', description: 'Study of chemical processes and equipment' },
  { code: 'BSCHEM', name: 'BS Chemistry', description: 'Study of the composition, structure, and properties of substances' },
  { code: 'BSCE', name: 'BS Civil Engineering', description: 'Study of design and construction of infrastructure' },
  { code: 'BSCS', name: 'BS Computer Science', description: 'Study of computing theory and programming' },
  { code: 'BSDC', name: 'BS Development Communication', description: 'Study of communication for development' },
  { code: 'BSE', name: 'BS Economics', description: 'Study of production, distribution, and consumption of goods' },
  { code: 'BSEE', name: 'BS Electrical Engineering', description: 'Study of electrical systems and equipment' },
  { code: 'BSFST', name: 'BS Food Science and Technology', description: 'Study of food production and preservation' },
  { code: 'BSF', name: 'BS Forestry', description: 'Study of forest management and conservation' },
  { code: 'BSHE', name: 'BS Human Ecology', description: 'Study of human interaction with the environment' },
  { code: 'BSIE', name: 'BS Industrial Engineering', description: 'Study of optimization of complex systems and processes' },
  { code: 'BSMAT', name: 'BS Mathematics', description: 'Study of numbers, quantities, and shapes' },
  { code: 'BSMST', name: 'BS Mathematics and Science Teaching', description: 'Study of teaching mathematics and science' },
  { code: 'BSN', name: 'BS Nutrition', description: 'Study of food and its effects on health' },
  { code: 'BSSTAT', name: 'BS Statistics', description: 'Study of collecting, analyzing, and interpreting data' }
];

// Seed the database with programs
const seedPrograms = async () => {
  try {
    // Clear existing programs
    await Program.deleteMany({});
    
    // Insert new programs
    const createdPrograms = await Program.insertMany(programs);
    
    console.log('Programs seeded successfully!');
    console.log(`${createdPrograms.length} programs created.`);
    
    // Display created programs with IDs
    createdPrograms.forEach(program => {
      console.log(`${program.code} - ${program.name} (ID: ${program._id})`);
    });
  } catch (error) {
    console.error('Error seeding programs:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the seed function
seedPrograms(); 