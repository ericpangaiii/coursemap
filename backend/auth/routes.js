import express from 'express';
import passport from './passport.js';
import User from '../models/user.js';

const router = express.Router();

// Initialize Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
  '/google/callback',
  (req, res, next) => {
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
        
        // Check if this is a new user (just created) or an existing user
        const isNewUser = user.createdAt && 
                        ((new Date().getTime() - new Date(user.createdAt).getTime()) < 10000); // within 10 seconds
        
        // Determine success message based on whether it's a new or existing user
        const successParam = isNewUser 
          ? 'account_created' 
          : 'login_success';
        
        // Successful authentication, redirect to home page with success message
        return res.redirect(
          process.env.NODE_ENV === 'production'
            ? `https://your-production-domain.com/home?success=${successParam}`
            : `http://localhost:5173/home?success=${successParam}`
        );
      });
    })(req, res, next);
  }
);

// Update user program route
router.post('/update-program', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { programId } = req.body;
  
  if (!programId) {
    return res.status(400).json({ error: 'Program ID is required' });
  }

  try {
    // Update the user's program in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { program: programId },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user in the session
    req.user.program = programId;
    
    res.status(200).json({ 
      success: true, 
      message: 'Program updated successfully',
      user: {
        id: updatedUser._id,
        googleId: updatedUser.googleId,
        name: updatedUser.name,
        email: updatedUser.email,
        displayPicture: updatedUser.displayPicture || '',
        program: updatedUser.program
      }
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    // Log the user object for debugging
    console.log('User from session:', req.user);
    
    return res.status(200).json({
      authenticated: true,
      user: {
        id: req.user._id,
        googleId: req.user.googleId,
        name: req.user.name,
        email: req.user.email,
        displayPicture: req.user.displayPicture || '',
        program: req.user.program || null
      }
    });
  }
  return res.status(200).json({
    authenticated: false
  });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    // Instead of redirect, return success JSON response
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
});

export default router; 