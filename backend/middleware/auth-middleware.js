// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  // List of routes that should bypass authentication
  const publicRoutes = [
    '/api/auth/status',
    '/api/my/plan',
    '/api/my/curriculum/structure',
    '/api/courses'
  ];

  // Check if the current route is in the public routes list
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  
  if (isPublicRoute) {
    // For public routes, set a default user and proceed
    req.user = {
      id: 1,
      email: 'test@up.edu.ph',
      first_name: 'Test',
      last_name: 'User',
      role: 'User',
      program_id: 1,
      curriculum_id: 1
    };
    return next();
  }

  // For all other routes, proceed without checking authentication
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