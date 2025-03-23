import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../database/index.js';
import { findOrCreateUserByGoogleId } from './user-controllers.js';

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
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
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
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.redirect(
        process.env.NODE_ENV === 'production'
          ? 'https://your-production-domain.com/sign-in?error=authentication_failed'
          : 'http://localhost:5173/sign-in?error=authentication_error'
      );
    }
    
    if (!user) {
      console.error('Authentication failed, no user returned');
      return res.redirect(
        process.env.NODE_ENV === 'production'
          ? 'https://your-production-domain.com/sign-in?error=authentication_failed'
          : 'http://localhost:5173/sign-in?error=authentication_failed'
      );
    }
    
    // Log in the user
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.redirect(
          process.env.NODE_ENV === 'production'
            ? 'https://your-production-domain.com/sign-in?error=login_failed'
            : 'http://localhost:5173/sign-in?error=login_failed'
        );
      }
      
      // Check if user has a program_id
      const isNewUserWithoutProgram = !user.program_id;
      
      // Redirect new users without program to degree selection page, others to home
      const redirectPath = isNewUserWithoutProgram ? 'degree-select' : 'home';
      
      return res.redirect(
        process.env.NODE_ENV === 'production'
          ? `https://your-production-domain.com/${redirectPath}`
          : `http://localhost:5173/${redirectPath}`
      );
    });
  })(req, res, next);
};

// Update user program
export const updateUserProgram = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { programId } = req.body;
  
  if (!programId) {
    return res.status(400).json({ error: 'Program ID is required' });
  }

  try {
    // Update the user's program in the database
    const updateResult = await pool.query(
      'UPDATE users SET program_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [programId, req.user.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = updateResult.rows[0];
    
    // Update the user in the session
    req.user.program_id = programId;
    
    res.status(200).json({ 
      success: true, 
      message: 'Program updated successfully',
      user: {
        id: updatedUser.id,
        google_id: updatedUser.google_id,
        name: updatedUser.name,
        email: updatedUser.email,
        display_picture: updatedUser.display_picture || '',
        program_id: updatedUser.program_id
      }
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
};

// Check authentication status
export const getAuthStatus = (req, res) => {
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
        display_picture: req.user.display_picture || '',
        program_id: req.user.program_id || null
      }
    });
  }
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