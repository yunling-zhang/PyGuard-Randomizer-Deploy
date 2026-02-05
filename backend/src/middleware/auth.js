// Authentication middleware to protect routes

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

export const optionalAuth = (req, res, next) => {
  // Just passes through - user may or may not be authenticated
  next();
};
