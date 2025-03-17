import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import session from 'express-session';
import passport from './auth/passport.js';
import router from "./routes.js"
import authRoutes from "./auth/routes.js";
import connectToMongoDB from "./database.js";

// load port number from .env file
dotenv.config();

// initialize the express app
const app = express();

// Configure CORS properly
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply CORS middleware with proper options
app.use(cors(corsOptions));
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: 'coursemap_secret_key', // You should use a more secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// initialize the routers
router(app);
app.use('/auth', authRoutes);

// connect to the database
connectToMongoDB();

// start the server
app.listen(process.env.PORT, () => {
  console.log('Server has started on port ' + process.env.PORT);
});