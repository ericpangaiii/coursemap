import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
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
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        // If user doesn't exist, create a new one
        if (!user) {
          // Extract user data directly from the profile
          const userData = {
            googleId: profile.id,
            name: profile.displayName || profile._json?.name || 'Unknown User',
            email: profile.emails?.[0]?.value || `${profile.id}@example.com`,
            displayPicture: profile.photos?.[0]?.value || ''
          };
          
          console.log('Creating new user with data:', userData);
          
          // Create the user with explicit data
          user = new User(userData);
          await user.save();
          
          console.log('New user created successfully:', user);
        } else {
          // Update existing user's photo if it has changed
          if (profile.photos && profile.photos.length > 0 && user.displayPicture !== profile.photos[0].value) {
            user.displayPicture = profile.photos[0].value;
            await user.save();
          }
          
          // Also ensure name is updated if needed
          if (profile.displayName && user.name !== profile.displayName) {
            user.name = profile.displayName;
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Error creating/updating user:', error);
        return done(error, null);
      }
    }
  )
);

export default passport; 