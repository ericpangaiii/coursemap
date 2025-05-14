// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  // Always proceed without checking authentication
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
  // Always proceed without checking admin status
  next();
};

// Combined middleware for admin routes
export const authMiddleware = (req, res, next) => {
  // Always proceed without checking authentication
  next();
}; 