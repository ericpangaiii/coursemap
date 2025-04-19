import pool from '../database/index.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const result = await pool.query(`
      SELECT 
        u.*, 
        p.title as program_title,
        p.acronym as program_acronym,
        c.name as curriculum_name
      FROM users u
      LEFT JOIN programs p ON u.program_id = p.program_id
      LEFT JOIN curriculums c ON u.curriculum_id = c.curriculum_id
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
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Capitalize the role
    const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    // Update the user's role
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [capitalizedRole, id]
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
      'INSERT INTO users (google_id, name, email, photo, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [googleId, profile.displayName, profile.emails[0].value, profile.photos[0].value, 'User']
    );
    
    return newUserResult.rows[0];
  } catch (error) {
    console.error('Error in findOrCreateUserByGoogleId:', error);
    throw error;
  }
};

// Delete a user and all associated data
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the requesting user is an admin
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Start a transaction
    await pool.query('BEGIN');

    try {
      // First, get all plans for the user
      const plansResult = await pool.query(
        'SELECT id FROM plans WHERE user_id = $1',
        [id]
      );

      // Delete all plan courses for each plan
      for (const plan of plansResult.rows) {
        await pool.query(
          'DELETE FROM plan_courses WHERE plan_id = $1',
          [plan.id]
        );
      }

      // Delete all plans for the user
      await pool.query(
        'DELETE FROM plans WHERE user_id = $1',
        [id]
      );

      // Finally, delete the user
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: "User not found" });
      }

      // Commit the transaction
      await pool.query('COMMIT');
      res.json({ message: "User and all associated data deleted successfully" });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
