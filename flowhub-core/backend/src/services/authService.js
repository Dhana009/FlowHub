/**
 * Auth Service
 * 
 * Contains all business logic for authentication flows.
 * No HTTP concerns - pure business logic.
 */

const User = require('../models/User');
const { hashPassword, verifyPassword, validatePasswordStrength } = require('../utils/password');
const { generateJWT, generateRefreshToken, verifyRefreshToken } = require('./tokenService');
const { generateOTP, storeOTP, verifyOTP, consumeOTP, checkOTPRateLimit } = require('./otpService');
const activityService = require('./activityService');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * Login user
 * 
 * @param {string} email - User email (will be lowercased)
 * @param {string} password - Plain text password
 * @param {boolean} rememberMe - Whether to remember user
 * @param {object} req - Express request (for logging)
 * @returns {Promise<{token: string, refreshToken: string, user: object}>}
 * @throws {Error} - If login fails
 */
async function login(email, password, rememberMe = false, req = null) {
  const emailLower = email.toLowerCase();

  // Check if account is locked
  const isLocked = await checkAccountLockout(emailLower);
  if (isLocked) {
    const error = new Error('Account is locked due to too many failed login attempts. Please try again later.');
    error.statusCode = 401;
    throw error;
  }

  // Find user by email (include passwordHash)
  const user = await User.findOne({ email: emailLower }).select('+passwordHash');
  if (!user) {
    await incrementFailedAttempts(emailLower);
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is active (Security Guardrail)
  if (user.isActive === false) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await incrementFailedAttempts(emailLower);
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate tokens
  const token = generateJWT(user._id.toString(), user.email, user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email, rememberMe);

  // Update user: reset login attempts, update lastLogin
  user.loginAttempts.count = 0;
  user.loginAttempts.lastAttempt = null;
  user.loginAttempts.lockedUntil = null;
  user.lastLogin = new Date();
  await user.save();

  // Log activity (Flow 9)
  activityService.logActivity({
    userId: user._id,
    action: 'USER_LOGIN',
    resourceType: 'USER',
    resourceId: user._id,
    details: { method: 'password' },
    req
  });

  // Return user without passwordHash
  const userObj = user.toObject();
  delete userObj.passwordHash;

  return {
    token,
    refreshToken,
    user: userObj
  };
}

/**
 * Sign up new user
 * 
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @param {string} otp - 6-digit OTP
 * @param {string} role - Optional role (default: EDITOR)
 * @returns {Promise<{token: string, refreshToken: string, user: object}>}
 * @throws {Error} - If signup fails
 */
async function signup(firstName, lastName, email, password, otp, role = 'EDITOR') {
  const emailLower = email.toLowerCase();

  // Validate role if provided
  const allowedRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
  if (role && !allowedRoles.includes(role)) {
    const error = new Error('Invalid role specified');
    error.statusCode = 400;
    throw error;
  }

  // Consume OTP (verify and mark as used)
  // This is called after verify-otp endpoint has already validated it
  await consumeOTP(emailLower, otp, 'signup');

  // Check if email already exists
  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    const error = new Error(passwordValidation.error);
    error.statusCode = 422;
    throw error;
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: emailLower,
    passwordHash: passwordHash,
    role: role || 'EDITOR'
  });

  // Generate tokens
  const token = generateJWT(user._id.toString(), user.email, user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), user.email, false);

  // Return user without passwordHash
  const userObj = user.toObject();
  delete userObj.passwordHash;

  return {
    token,
    refreshToken,
    user: userObj
  };
}

/**
 * Request OTP for signup or password reset
 * 
 * @param {string} email - User email
 * @param {string} type - OTP type ('signup' or 'password-reset')
 * @returns {Promise<{message: string, expiresIn: number}>}
 * @throws {Error} - If rate limit exceeded or other error
 */
async function requestOTP(email, type) {
  const emailLower = email.toLowerCase();

  // Check rate limit
  const isAllowed = await checkOTPRateLimit(emailLower, type);
  if (!isAllowed) {
    throw new Error('Too many OTP requests. Please wait 15 minutes before requesting again.');
  }

  // For password reset, check if user exists
  if (type === 'password-reset') {
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      // Still generate OTP to prevent email enumeration
    }
  }

  // Generate and store OTP
  const otp = generateOTP();
  await storeOTP(emailLower, otp, type);

  // In production, send OTP via email/SMS
  // For development/testing, log OTP to console (never expose in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OTP for ${emailLower} (${type})]: ${otp}`);
  }

  const response = {
    message: 'OTP sent successfully',
    expiresIn: 10 // minutes
  };

  // NEVER include OTP in response in production
  // Only include in development for testing convenience
  if (process.env.NODE_ENV === 'development') {
    response.otp = otp;
  }

  return response;
}

/**
 * Verify OTP
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} type - OTP type
 * @returns {Promise<boolean>}
 * @throws {Error} - If OTP is invalid
 */
async function verifyOTPForAuth(email, otp, type) {
  const emailLower = email.toLowerCase();
  return await verifyOTP(emailLower, otp, type);
}

/**
 * Reset password
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 * @throws {Error} - If reset fails
 */
async function resetPassword(email, otp, newPassword) {
  const emailLower = email.toLowerCase();

  // STEP 1: Verify OTP (but don't mark as used yet)
  // This allows user to retry if password validation fails
  await verifyOTP(emailLower, otp, 'password-reset');

  // STEP 2: Find user (include passwordHash which is normally excluded)
  const user = await User.findOne({ email: emailLower }).select('+passwordHash');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // STEP 3: Validate password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    const error = new Error(passwordValidation.error);
    error.statusCode = 422;
    throw error;
  }

  // STEP 4: Check if new password is the same as old password
  // Only check if user has an existing password hash
  if (user.passwordHash) {
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      const error = new Error('New password must be different from your current password');
      error.statusCode = 422;
      throw error;
    }
  }

  // STEP 5: All validations passed - NOW consume OTP and update password
  // This ensures OTP is only consumed if password reset will succeed
  await consumeOTP(emailLower, otp, 'password-reset');

  // STEP 6: Hash new password
  const passwordHash = await hashPassword(newPassword);

  // STEP 7: Update user password
  user.passwordHash = passwordHash;
  await user.save();

  return {
    message: 'Password reset successfully'
  };
}

/**
 * Check if account is locked
 * 
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if account is locked
 */
async function checkAccountLockout(email) {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Bypass lockout for test environment
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  if (!user || !user.loginAttempts.lockedUntil) {
    return false;
  }

  // Check if lockout has expired
  if (new Date() > user.loginAttempts.lockedUntil) {
    // Lockout expired, reset it
    user.loginAttempts.count = 0;
    user.loginAttempts.lockedUntil = null;
    await user.save();
    return false;
  }

  return true;
}

/**
 * Increment failed login attempts and lock account if needed
 * 
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
async function incrementFailedAttempts(email) {
  // Bypass increment for test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return; // User doesn't exist, can't increment
  }

  user.loginAttempts.count += 1;
  user.loginAttempts.lastAttempt = new Date();

  // Lock account if max attempts reached
  if (user.loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
    user.loginAttempts.lockedUntil = lockedUntil;
  }

  await user.save();
}

/**
 * Refresh access token using refresh token
 * 
 * @param {string} refreshToken - Refresh token from cookie
 * @returns {Promise<{token: string, user: object}>}
 * @throws {Error} - If refresh fails
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(decoded.sub);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if user is active (Security Guardrail)
  if (user.isActive === false) {
    const error = new Error('Account deactivated');
    error.statusCode = 401;
    throw error;
  }

  // Generate new access token
  const token = generateJWT(user._id.toString(), user.email, user.role);

  // Return user without passwordHash
  const userObj = user.toObject();
  delete userObj.passwordHash;

  return {
    token,
    user: userObj
  };
}

module.exports = {
  login,
  signup,
  requestOTP,
  verifyOTP: verifyOTPForAuth,
  resetPassword,
  refreshAccessToken,
  checkAccountLockout,
  incrementFailedAttempts
};

