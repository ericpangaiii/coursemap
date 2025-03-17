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
          // Ensure we have the photo URL from profile
          const photoUrl = profile.photos && profile.photos.length > 0 
            ? profile.photos[0].value 
            : '';
            
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: photoUrl
          });
        } else {
          // Update existing user's photo if it has changed
          if (profile.photos && profile.photos.length > 0 && user.photo !== profile.photos[0].value) {
            user.photo = profile.photos[0].value;
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport; 