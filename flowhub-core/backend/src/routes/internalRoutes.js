/**
 * Internal Routes (Automation Hooks)
 * 
 * Defines endpoints for high-scale automation setups.
 * Flow C - Automation Blueprint
 */

const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internalController');

/**
 * POST /api/v1/internal/reset
 * Wipes all data for a clean test run.
 */
router.post('/reset', internalController.resetDB);

/**
 * GET /api/v1/internal/otp
 * Returns the latest OTP for a given email.
 */
router.get('/otp', internalController.getOTP);

/**
 * POST /api/v1/internal/seed
 * Injects multiple items for scale testing.
 */
router.post('/seed', internalController.seedData);

module.exports = router;

