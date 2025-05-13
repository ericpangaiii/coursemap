import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../database/index.js';
import { findOrCreateUserByGoogleId } from './user-controllers.js';

// Initialize dotenv
dotenv.config();

// Configure Passport
export const configurePassport = () => {
  // Verify Google OAuth environment variables
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.error('Error: Google OAuth CLIENT_ID and CLIENT_SECRET must be set in .env');
    process.exit(1);
  }

  // Add these serialization functions
  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    // Store the entire user object in the session
    done(null, user);
  });

  passport.deserializeUser(async (user, done) => {
    console.log('Deserializing user:', user);
    try {
      // Since we're storing the entire user object, we don't need to query the database
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' 
          ? `${process.env.PRODUCTION_BACKEND_URL}/auth/google/callback`
          : `${process.env.BACKEND_URL}/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Log the profile for debugging
          console.log('Google Profile:', JSON.stringify(profile, null, 2));
          
          // Find or create user with PostgreSQL
          const user = await findOrCreateUserByGoogleId(profile.id, profile);
          
          return done(null, user);
        } catch (error) {
          console.error('Error creating/updating user:', error);
          return done(error, null);
        }
      }
    )
  );

  return passport;
};

// Google login handler
export const googleLogin = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google callback handler
export const googleCallback = (req, res, next) => {
  console.log('Google callback received:', {
    query: req.query,
    session: req.session,
    cookies: req.cookies
  });

  // Verify environment variables are set
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.PRODUCTION_BACKEND_URL) {
      console.error('Error: PRODUCTION_BACKEND_URL must be set in production');
      return res.status(500).send('Server configuration error: PRODUCTION_BACKEND_URL not set');
    }
    if (!process.env.PRODUCTION_FRONTEND_URL) {
      console.error('Error: PRODUCTION_FRONTEND_URL must be set in production');
      return res.status(500).send('Server configuration error: PRODUCTION_FRONTEND_URL not set');
    }
  } else {
    if (!process.env.FRONTEND_URL) {
      console.error('Error: FRONTEND_URL must be set in development');
      return res.status(500).send('Server configuration error: FRONTEND_URL not set');
    }
  }

  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.redirect(
        process.env.NODE_ENV === 'production'
          ? `${process.env.PRODUCTION_FRONTEND_URL}/sign-in?error=authentication_error`
          : `${process.env.FRONTEND_URL}/sign-in?error=authentication_error`
      );
    }
    
    if (!user) {
      console.error('Authentication failed, no user returned');
      return res.redirect(
        process.env.NODE_ENV === 'production'
          ? `${process.env.PRODUCTION_FRONTEND_URL}/sign-in?error=authentication_failed`
          : `${process.env.FRONTEND_URL}/sign-in?error=authentication_failed`
      );
    }
    
    // Log in the user
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.redirect(
          process.env.NODE_ENV === 'production'
            ? `${process.env.PRODUCTION_FRONTEND_URL}/sign-in?error=login_failed`
            : `${process.env.FRONTEND_URL}/sign-in?error=login_failed`
        );
      }

      console.log('User logged in successfully:', {
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      // Check if user has a program_id
      const isNewUserWithoutProgram = !user.program_id;
      
      // Redirect based on user role and program status
      let redirectPath;
      if (user.role === 'Admin') {
        redirectPath = 'admin';
      } else if (isNewUserWithoutProgram) {
        redirectPath = 'degree-select';
      } else {
        redirectPath = 'dashboard';
      }
      
      const redirectUrl = process.env.NODE_ENV === 'production'
        ? `${process.env.PRODUCTION_FRONTEND_URL}/${redirectPath}`
        : `${process.env.FRONTEND_URL}/${redirectPath}`;

      console.log('Redirecting to:', redirectUrl);
      
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
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
        google_id: updatedUser.google_id,
        name: updatedUser.name,
        email: updatedUser.email,
        photo: updatedUser.photo || '',
        program_id: updatedUser.program_id,
        curriculum_id: updatedUser.curriculum_id || null
      }
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
};

// Check authentication status
export const getAuthStatus = (req, res) => {
  console.log('getAuthStatus called');
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  
  if (req.isAuthenticated()) {
    // Log the user object for debugging
    console.log('User from session:', req.user);
    
    return res.status(200).json({
      authenticated: true,
      user: {
        id: req.user.id,
        google_id: req.user.google_id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo || '',
        program_id: req.user.program_id || null,
        curriculum_id: req.user.curriculum_id || null,
        role: req.user.role || 'User'
      }
    });
  }
  console.log('User not authenticated');
  return res.status(200).json({
    authenticated: false
  });
};

// Logout user
export const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    // Instead of redirect, return success JSON response
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}; 