/**
 * Activity Routes
 * 
 * API routes for retrieving audit logs.
 * Flow 9 - Activity Logs
 */

const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// All activity routes require authentication
router.use(verifyToken);

/**
 * GET /api/v1/activities
 * Get activity logs with RBAC filtering
 */
router.get('/', activityController.getActivities);

module.exports = router;

