import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { configurePassport } from './controllers/auth-controllers.js';
import router from "./routes.js";
import { connectDatabase } from './database/index.js';

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
app.use(session({
  store: new PostgresStore({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 // Remove expired sessions every 60 minutes
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'none',
    domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
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
  console.log('Session after passport:', req.session);
  console.log('User after passport:', req.user);
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