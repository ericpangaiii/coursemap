import express from 'express';
import passport from './passport.js';

const router = express.Router();

// Initialize Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com/sign-in' 
      : 'http://localhost:5173/sign-in'
  }),
  (req, res) => {
    // Successful authentication, redirect to home page
    res.redirect(
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com/home'
        : 'http://localhost:5173/home'
    );
  }
);

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
        displayName: req.user.displayName,
        email: req.user.email,
        photo: req.user.photo || ''
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