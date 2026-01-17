/**
 * Auth Middleware
 * 
 * Protects routes by verifying JWT tokens.
 * Attaches user info to request object.
 */

const { verifyJWT } = require('../services/tokenService');
const User = require('../models/User');

/**
 * Verify JWT token from Authorization header
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function verifyToken(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required. Please log in.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token signature and expiration
    const decoded = verifyJWT(token);

    // CRITICAL SECURITY CHECK: Verify user still exists in DB
    // This handles the "User deleted from DB but token still valid" bug
    const user = await User.findById(decoded.sub).select('+isActive');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'User Deleted',
        message: 'Your account no longer exists. Access denied.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        status: 'error',
        error_code: 403,
        error_type: 'Account Deactivated',
        message: 'Your account has been deactivated. Please contact support.',
        timestamp: new Date().toISOString(),
        path: req.originalUrl || req.path
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      error_code: 401,
      error_type: 'Invalid Token',
      message: 'Your session is invalid or has expired. Please log in again.',
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.path
    });
  }
}

module.exports = {
  verifyToken
};

