import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { configurePassport } from './controllers/auth-controllers.js';
import router from "./routes.js";
import { connectDatabase } from './database/index.js';
import pool from './database/index.js';

// load port number from .env file
dotenv.config();

// initialize the express app
const app = express();

// Configure passport
const passport = configurePassport();

// Configure CORS properly
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_FRONTEND_URL 
    : process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with proper options
app.use(cors(corsOptions));
app.use(express.json());

// Create session store
const PostgresStore = pgSession(session);

// Configure session middleware
// In server.js, replace the session configuration with this:
app.use(session({
  store: new PostgresStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // Remove the domain setting entirely - let the browser handle it
    // domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
    path: '/'
  },
  name: 'connect.sid'
}));

// Add this before passport initialization
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  next();
});

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add this after passport initialization
app.use((req, res, next) => {
  console.log('=== Session Debug ===');
  console.log('URL:', req.url);
  console.log('Session ID:', req.sessionID);
  console.log('Session:', JSON.stringify(req.session, null, 2));
  console.log('User:', req.user);
  console.log('Is Authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'undefined');
  console.log('Cookies:', req.cookies);
  console.log('=== End Debug ===');
  next();
});

// initialize the routers
router(app);

// Connect to database
connectDatabase()
  .then(() => {
    // Start the server only after database connection is established
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server has started on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });