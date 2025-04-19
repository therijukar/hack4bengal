/**
 * Role-based middleware for complaint routes
 * @param {string|string[]} roles - Allowed roles for the route
 * @returns {function} Express middleware function
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // If no user is attached to the request (not authenticated)
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has the required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }

    // User has required role, proceed
    next();
  };
};

module.exports = roleMiddleware; 