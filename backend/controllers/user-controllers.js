import pool from '../database/index.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const result = await pool.query(`
      SELECT u.*, p.title as program_title 
      FROM users u
      LEFT JOIN programs p ON u.program_id = p.program_id
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get a user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT u.*, p.title as program_title 
      FROM users u
      LEFT JOIN programs p ON u.program_id = p.program_id
      WHERE u.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Create a new user (usually done through auth, but included for completeness)
export const createUser = async (req, res) => {
  try {
    const { google_id, name, email, photo, program_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (google_id, name, email, photo, program_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [google_id, name, email, photo, program_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if the requesting user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Update the user's role
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Get or create user by Google ID (for OAuth)
export const findOrCreateUserByGoogleId = async (googleId, profile) => {
  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    
    // If user exists, return user
    if (userResult.rows.length > 0) {
      return userResult.rows[0];
    }
    
    // If user doesn't exist, create new user
    const newUserResult = await pool.query(
      'INSERT INTO users (google_id, name, email, photo) VALUES ($1, $2, $3, $4) RETURNING *',
      [googleId, profile.displayName, profile.emails[0].value, profile.photos[0].value]
    );
    
    return newUserResult.rows[0];
  } catch (error) {
    console.error('Error in findOrCreateUserByGoogleId:', error);
    throw error;
  }
};
