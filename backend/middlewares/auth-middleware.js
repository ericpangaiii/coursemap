// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('Authentication failed:', {
    session: req.session,
    user: req.user,
    cookies: req.cookies
  });
  res.status(401).json({ error: 'Not authenticated', details: 'Please log in to access this resource' });
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role?.toLowerCase() === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required', details: 'You do not have permission to access this resource' });
};

// Combined middleware for admin routes
export const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('Authentication failed in authMiddleware:', {
      session: req.session,
      user: req.user,
      cookies: req.cookies
    });
    return res.status(401).json({ error: 'Not authenticated', details: 'Please log in to access this resource' });
  }
  if (req.user.role?.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', details: 'You do not have permission to access this resource' });
  }
  next();
}; 