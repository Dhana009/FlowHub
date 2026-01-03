/**
 * Auth Controller
 * 
 * Handles HTTP requests/responses for authentication endpoints.
 * No business logic - delegates to authService.
 */

const authService = require('../services/authService');
const { validateEmail, validateName, validateOTP } = require('../utils/validation');

/**
 * Set refresh token cookie
 * 
 * @param {object} res - Express response
 * @param {string} refreshToken - Refresh token
 * @param {boolean} rememberMe - Whether to remember user
 */
function setRefreshTokenCookie(res, refreshToken, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  // PRODUCTION HARDENING: 
  // SameSite: 'none' and Secure: true are REQUIRED for Vercel -> Render communication
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // Required for cross-site cookies
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAge,
    path: '/'
  });
}

/**
 * Clear refresh token cookie
 * 
 * @param {object} res - Express response
 */
function clearRefreshTokenCookie(res) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: true, // Required for cross-site
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/'
  });
}

/**
 * Login endpoint handler
 * POST /auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Email and password are required'
      });
    }

    // Type validation: email must be a string (BUG-02 fix)
    if (typeof email !== 'string') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Email must be a string'
      });
    }

    // Type validation: password must be a string
    if (typeof password !== 'string') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be a string'
      });
    }

    // Basic password validation: must not be empty
    if (password.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Password cannot be empty'
      });
    }

    // Minimum length validation for boundary testing
    if (password.length < 8) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be at least 8 characters long'
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: emailError
      });
    }

    // Business logic
    const result = await authService.login(email, password, rememberMe || false, req);

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken, rememberMe || false);

    // Return response
    res.status(200).json({
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // BUG-03, BUG-06 fix: Handle authentication errors with proper 401 status
    // Check if error has statusCode property (from service layer) or match by message
    if (error.statusCode === 401 ||
      error.message.includes('Invalid email or password') ||
      error.message.includes('Account is locked') ||
      error.message.includes('Account deactivated') ||
      error.message.includes('deactivated')) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: error.message || 'Invalid email or password'
      });
    }
    next(error);
  }
}

/**
 * Request signup OTP endpoint handler
 * POST /auth/signup/request-otp
 */
async function requestSignupOTP(req, res, next) {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Email is required'
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: emailError
      });
    }

    // Business logic
    const result = await authService.requestOTP(email, 'signup');

    const response = {
      message: result.message,
      expiresIn: result.expiresIn
    };

    // Include OTP in response only in development mode for testing
    // NEVER expose OTP in production
    if (process.env.NODE_ENV === 'development' && result.otp) {
      response.otp = result.otp;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Verify signup OTP endpoint handler
 * POST /auth/signup/verify-otp
 */
async function verifySignupOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Email and OTP are required'
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      const error = new Error(emailError);
      error.statusCode = 422;
      return next(error);
    }

    const otpError = validateOTP(otp);
    if (otpError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: otpError
      });
    }

    // Business logic
    await authService.verifyOTP(email, otp, 'signup');

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Signup endpoint handler
 * POST /auth/signup
 */
async function signup(req, res, next) {
  try {
    const { firstName, lastName, email, password, otp, role } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password || !otp) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'All fields are required'
      });
    }

    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: firstNameError
      });
    }

    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: lastNameError
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      const error = new Error(emailError);
      error.statusCode = 422;
      return next(error);
    }

    const otpError = validateOTP(otp);
    if (otpError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: otpError
      });
    }

    // Type validation: password must be a string (BUG-01, BUG-05 fix)
    if (typeof password !== 'string') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be a string'
      });
    }

    // Password length validation (BUG-05 fix: prevent short passwords from reaching service layer)
    if (password.length < 8) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Validate role enum if provided
    // If role is provided (not undefined), it must be a non-empty string in the allowed enum
    if (role !== undefined) {
      const allowedRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
      // Reject empty string, null, or invalid enum values
      if (!role || typeof role !== 'string' || role.trim() === '' || !allowedRoles.includes(role)) {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Invalid enum value',
          message: 'Role must be one of: ADMIN, EDITOR, VIEWER. Empty string is not allowed.',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
    }

    // Business logic
    const result = await authService.signup(firstName, lastName, email, password, otp, role);

    // Set refresh token cookie
    setRefreshTokenCookie(res, result.refreshToken, false);

    // Return response
    res.status(201).json({
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('already registered') || error.message.includes('duplicate')) {
      error.statusCode = 409;
      return next(error);
    }
    // Handle password validation errors (from service layer)
    if (error.message.includes('Password must be') || error.message.includes('password')) {
      error.statusCode = 422;
      return next(error);
    }
    next(error);
  }
}

/**
 * Request password reset OTP endpoint handler
 * POST /auth/forgot-password/request-otp
 */
async function requestPasswordResetOTP(req, res, next) {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Email is required'
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: emailError
      });
    }

    // Business logic
    const result = await authService.requestOTP(email, 'password-reset');

    // Security: Don't reveal if email exists
    res.status(200).json({
      message: 'If this email exists, OTP has been sent.',
      expiresIn: result.expiresIn
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify password reset OTP endpoint handler
 * POST /auth/forgot-password/verify-otp
 */
async function verifyPasswordResetOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Email and OTP are required'
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      const error = new Error(emailError);
      error.statusCode = 422;
      return next(error);
    }

    const otpError = validateOTP(otp);
    if (otpError) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: otpError
      });
    }

    // Business logic
    await authService.verifyOTP(email, otp, 'password-reset');

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password endpoint handler
 * POST /auth/forgot-password/reset
 */
async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    // Input validation
    if (!email || !otp || !newPassword) {
      const error = new Error('Email, OTP, and new password are required');
      error.statusCode = 400;
      return next(error);
    }

    const emailError = validateEmail(email);
    if (emailError) {
      const error = new Error(emailError);
      error.statusCode = 422;
      return next(error);
    }

    const otpError = validateOTP(otp);
    if (otpError) {
      const error = new Error(otpError);
      error.statusCode = 422;
      return next(error);
    }

    // Type validation: newPassword must be a string
    if (typeof newPassword !== 'string') {
      const error = new Error('New password must be a string');
      error.statusCode = 422;
      return next(error);
    }

    // Business logic
    const result = await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh token endpoint handler
 * POST /auth/refresh
 */
async function refreshToken(req, res, next) {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Refresh token not found'
      });
    }

    // Business logic
    const result = await authService.refreshAccessToken(refreshToken);

    // Return new access token
    res.status(200).json({
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Clear invalid refresh token cookie
    clearRefreshTokenCookie(res);

    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Refresh token expired or invalid'
      });
    }

    next(error);
  }
}

/**
 * Logout endpoint handler
 * POST /auth/logout
 */
async function logout(req, res, next) {
  try {
    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user (checkpoint endpoint)
 * GET /auth/me
 * 
 * Validates access token and returns current authenticated user info.
 * Used as a checkpoint to verify authentication state.
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Get full user data from database
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'User Not Found',
        message: 'Your account no longer exists. Access denied.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        status: 'error',
        error_code: 403,
        error_type: 'Account Deactivated',
        message: 'Your account has been deactivated. Please contact support.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Return user without passwordHash
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      status: 'success',
      data: {
        _id: userObj._id,
        email: userObj.email,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        role: userObj.role,
        isActive: userObj.isActive,
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  refreshToken,
  requestSignupOTP,
  verifySignupOTP,
  signup,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  logout,
  getCurrentUser
};

