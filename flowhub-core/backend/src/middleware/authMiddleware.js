/**
 * Auth Middleware
 * 
 * Protects routes by verifying JWT tokens.
 * Attaches user info to request object.
 */

const { verifyJWT } = require('../services/tokenService');

/**
 * Verify JWT token from Authorization header
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
function verifyToken(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required - No token provided',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyJWT(token);

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      error_code: 401,
      error_type: 'Unauthorized',
      message: 'Authentication required - Invalid or expired token',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
}

module.exports = {
  verifyToken
};

