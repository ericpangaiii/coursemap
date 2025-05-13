// Environment variables must be prefixed with VITE_ to be exposed to the client

// Backend API base URL 
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://coursemap.up.railway.app';

// Frontend URL
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// Default configuration for API requests
export const DEFAULT_API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

// App name
export const APP_NAME = 'CourseMap';

// Google authentication settings
export const GOOGLE_AUTH = {
  authUrl: `${API_BASE_URL}/auth/google`,
};

// Export all environment variables in a single object for convenience
export const env = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  mode: import.meta.env.MODE,
}; 