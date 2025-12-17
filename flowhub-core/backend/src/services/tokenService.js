/**
 * Token Service
 * 
 * Handles JWT token generation and validation.
 * Manages access tokens and refresh tokens.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_REMEMBER = '30d'; // 30 days if rememberMe
const REFRESH_TOKEN_EXPIRY_DEFAULT = '7d'; // 7 days default

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

/**
 * Generate JWT access token
 * 
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
function generateJWT(userId, email, role) {
  const payload = {
    sub: userId,
    email: email,
    role: role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
}

/**
 * Generate refresh token
 * 
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {boolean} rememberMe - Whether to remember user (30 days) or default (7 days)
 * @returns {string} - Refresh token
 */
function generateRefreshToken(userId, email, rememberMe = false) {
  const payload = {
    sub: userId,
    email: email,
    type: 'refresh'
  };

  const expiresIn = rememberMe ? REFRESH_TOKEN_EXPIRY_REMEMBER : REFRESH_TOKEN_EXPIRY_DEFAULT;

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: expiresIn
  });
}

/**
 * Verify JWT access token
 * 
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * 
 * @param {string} token - Refresh token
 * @returns {object} - Decoded payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

module.exports = {
  generateJWT,
  generateRefreshToken,
  verifyJWT,
  verifyRefreshToken
};

