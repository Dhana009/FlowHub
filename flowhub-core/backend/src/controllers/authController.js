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
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 30 days or 7 days

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAge
  });
}

/**
 * Clear refresh token cookie
 * 
 * @param {object} res - Express response
 */
function clearRefreshTokenCookie(res) {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
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
      return res.status(422).json({
        error: emailError,
        statusCode: 422
      });
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
      return res.status(422).json({
        error: emailError,
        statusCode: 422
      });
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
      return res.status(409).json({
        error: 'This email is already registered',
        statusCode: 409
      });
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
      return res.status(422).json({
        error: emailError,
        statusCode: 422
      });
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
      return res.status(400).json({
        error: 'Email, OTP, and new password are required',
        statusCode: 400
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(422).json({
        error: emailError,
        statusCode: 422
      });
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

module.exports = {
  login,
  refreshToken,
  requestSignupOTP,
  verifySignupOTP,
  signup,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  logout
};

