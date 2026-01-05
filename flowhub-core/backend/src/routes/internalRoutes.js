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

/**
 * DELETE /api/v1/internal/users/:userId/data
 * Hard delete all data for a specific user (Items, BulkJobs, ActivityLogs, OTPs)
 * Preserves the User record itself
 * Query params: include_otp (default: true), include_activity_logs (default: true)
 */
router.delete('/users/:userId/data', internalController.cleanupUserData);

/**
 * DELETE /api/v1/internal/users/:userId/items
 * Hard delete only items for a specific user (preserves BulkJobs, ActivityLogs, OTPs)
 * Preserves the User record itself
 */
router.delete('/users/:userId/items', internalController.cleanupUserItems);

/**
 * DELETE /api/v1/internal/items/:id/permanent
 * Hard delete a single item by ID (removes from MongoDB)
 * Also deletes associated file from filesystem
 */
router.delete('/items/:id/permanent', internalController.hardDeleteItem);

module.exports = router;

