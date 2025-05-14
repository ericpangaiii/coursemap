// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  // Set default user for all routes
  req.user = {
    id: 1,
    email: 'test@up.edu.ph',
    first_name: 'Test',
    last_name: 'User',
    role: 'User',
    program_id: 1,
    curriculum_id: 1
  };
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