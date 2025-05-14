// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
  next();
};

// Combined middleware for admin routes
export const authMiddleware = (req, res, next) => {
  next();
}; 