/**
 * Rate Limiter Middleware
 * 
 * Prevents brute force attacks and abuse.
 * Checks account lockout and OTP rate limits.
 */

const authService = require('../services/authService');
const otpService = require('../services/otpService');

/**
 * Login rate limiter - checks account lockout
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function loginRateLimiter(req, res, next) {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        statusCode: 400
      });
    }

    // Type validation: email must be a string (prevent crash in middleware)
    if (typeof email !== 'string') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Email must be a string'
      });
    }

    // Check if account is locked
    const isLocked = await authService.checkAccountLockout(email.toLowerCase());

    if (isLocked) {
      return res.status(429).json({
        error: 'Account is locked due to too many failed login attempts. Please try again later.',
        statusCode: 429
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * OTP rate limiter - checks OTP request rate limit
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function otpRateLimiter(req, res, next) {
  try {
    const email = req.body.email;
    // Determine type from path
    const type = req.path.includes('signup') ? 'signup' : 'password-reset';

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        statusCode: 400
      });
    }

    // Type validation: email must be a string (prevent crash in middleware)
    if (typeof email !== 'string') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Email must be a string'
      });
    }

    // Check OTP rate limit
    const isAllowed = await otpService.checkOTPRateLimit(email.toLowerCase(), type);

    if (!isAllowed) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait 15 minutes before requesting again.',
        statusCode: 429
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loginRateLimiter,
  otpRateLimiter
};

