import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../database/index.js';

// Initialize dotenv
dotenv.config();

// Configure Passport
export const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return done(null, false);
      }
      done(null, result.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );

          if (result.rows.length === 0) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          const user = result.rows[0];

          // Compare password
          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, user);
        } catch (error) {
          console.error('Error in local strategy:', error);
          return done(error);
        }
      }
    )
  );

  return passport;
};

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, name, programId, curriculumId } = req.body;

    // Validate input
    if (!email || !password || !name || !programId || !curriculumId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate UP Mail
    if (!email.endsWith('@up.edu.ph')) {
      return res.status(400).json({ error: 'Only UP Mail accounts are allowed' });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Start a transaction
    await pool.query('BEGIN');

    try {
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, name, program_id, curriculum_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [email, passwordHash, name, programId, curriculumId, 'User']
      );

      const newUser = result.rows[0];

      // Create an empty plan for the user
      await pool.query(
        'INSERT INTO plans (user_id, curriculum_id) VALUES ($1, $2)',
        [newUser.id, curriculumId]
      );

      // Commit the transaction
      await pool.query('COMMIT');

      // Log in the user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error logging in after registration' });
        }
        res.status(201).json({
          message: 'Registration successful',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            program_id: newUser.program_id,
            curriculum_id: newUser.curriculum_id,
            role: newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1).toLowerCase()
          }
        });
      });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login handler
export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Error logging in' });
      }
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          program_id: user.program_id,
          curriculum_id: user.curriculum_id,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        }
      });
    });
  })(req, res, next);
};

// Logout handler
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// Check authentication status
export const getAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        program_id: req.user.program_id || null,
        curriculum_id: req.user.curriculum_id || null,
        role: req.user.role ? req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1).toLowerCase() : 'User'
      }
    });
  }
  return res.status(200).json({
    authenticated: false
  });
};

// Update user program
export const updateUserProgram = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { programId, curriculumId } = req.body;
  
  if (!programId) {
    return res.status(400).json({ error: 'Program ID is required' });
  }

  try {
    // Update the user's program in the database
    let updateQuery, updateParams;

    if (curriculumId) {
      updateQuery = 'UPDATE users SET program_id = $1, curriculum_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *';
      updateParams = [programId, curriculumId, req.user.id];
    } else {
      updateQuery = 'UPDATE users SET program_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
      updateParams = [programId, req.user.id];
    }

    const updateResult = await pool.query(updateQuery, updateParams);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = updateResult.rows[0];
    
    // Update the user in the session
    req.user.program_id = programId;
    if (curriculumId) {
      req.user.curriculum_id = curriculumId;
      
      // Create a study plan for the user if they have a curriculum
      try {
        // Check if user already has a plan
        const existingPlanResult = await pool.query(
          'SELECT * FROM plans WHERE user_id = $1',
          [req.user.id]
        );
        
        if (existingPlanResult.rows.length === 0) {
          // Create new plan
          await pool.query(
            'INSERT INTO plans (user_id, curriculum_id) VALUES ($1, $2)',
            [req.user.id, curriculumId]
          );
        }
      } catch (planError) {
        console.error('Error creating plan:', planError);
        // Continue even if plan creation fails
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Program updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        program_id: updatedUser.program_id,
        curriculum_id: updatedUser.curriculum_id || null
      }
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
}; 