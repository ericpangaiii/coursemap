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

// Email validation function
const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    if (!email.endsWith('@up.edu.ph')) {
      errors.push('Only UP Mail accounts are allowed');
    }
    if (!/^[A-Za-z0-9._%+-]+@up\.edu\.ph$/.test(email)) {
      errors.push('Invalid UP Mail format');
    }
  }
  
  return errors;
};

// Password validation function
const validatePassword = (password, isRegistration = false) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Only check character type requirements during registration
    if (isRegistration) {
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }
  }
  
  return errors;
};

// Name validation function
const validateName = (firstName, middleName, lastName, suffix) => {
  const errors = [];
  
  if (!firstName) {
    errors.push('First name is required');
  } else if (firstName.length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (middleName && middleName.length < 2) {
    errors.push('Middle name must be at least 2 characters long if provided');
  }
  
  if (!lastName) {
    errors.push('Last name is required');
  } else if (lastName.length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  if (suffix && suffix.length > 10) {
    errors.push('Suffix must not exceed 10 characters');
  }
  
  return errors;
};

// Register new user
export const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      middleName, 
      lastName, 
      suffix, 
      programId, 
      curriculumId 
    } = req.body;

    // Validate all fields
    const emailErrors = validateEmail(email);
    const passwordErrors = validatePassword(password, true); // Pass true for registration
    const nameErrors = validateName(firstName, middleName, lastName, suffix);
    
    const allErrors = [...emailErrors, ...passwordErrors, ...nameErrors];
    
    if (allErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: allErrors
      });
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
        `INSERT INTO users (
          email, 
          password_hash, 
          first_name, 
          middle_name, 
          last_name, 
          suffix, 
          program_id, 
          curriculum_id, 
          role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          email, 
          passwordHash, 
          firstName, 
          middleName || null, 
          lastName, 
          suffix || null, 
          programId, 
          curriculumId, 
          'User'
        ]
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
            firstName: newUser.first_name,
            middleName: newUser.middle_name,
            lastName: newUser.last_name,
            suffix: newUser.suffix,
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
          first_name: user.first_name,
          middle_name: user.middle_name,
          last_name: user.last_name,
          suffix: user.suffix,
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
        first_name: req.user.first_name,
        middle_name: req.user.middle_name,
        last_name: req.user.last_name,
        suffix: req.user.suffix,
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