/**
 * Auth Routes
 * 
 * Defines all authentication-related routes.
 * Applies middleware (rate limiting, authentication) as needed.
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { loginRateLimiter, otpRateLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)

// Login
router.post('/login', loginRateLimiter, authController.login);

// Refresh token (uses httpOnly cookie, no auth required)
router.post('/refresh', authController.refreshToken);

// Signup flow
router.post('/signup/request-otp', otpRateLimiter, authController.requestSignupOTP);
router.post('/signup/verify-otp', authController.verifySignupOTP);
router.post('/signup', authController.signup);

// Password reset flow
router.post('/forgot-password/request-otp', otpRateLimiter, authController.requestPasswordResetOTP);
router.post('/forgot-password/verify-otp', authController.verifyPasswordResetOTP);
router.post('/forgot-password/reset', authController.resetPassword);

// Protected routes (authentication required)

// Logout (requires authentication to clear tokens properly)
router.post('/logout', verifyToken, authController.logout);

module.exports = router;

