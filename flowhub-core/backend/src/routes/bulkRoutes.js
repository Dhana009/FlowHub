/**
 * Bulk Routes
 * 
 * Defines API routes for bulk operations.
 * Flow 7 - Bulk Operations
 */

const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulkController');
const { verifyToken } = require('../middleware/authMiddleware');

// All bulk operations require authentication
router.use(verifyToken);

/**
 * POST /api/v1/bulk-operations
 * Initiate a new bulk operation
 */
router.post('/', bulkController.startBulkOperation);

/**
 * GET /api/v1/bulk-operations/:jobId
 * Poll status of a bulk operation (includes lazy processing)
 */
router.get('/:jobId', bulkController.getBulkJobStatus);

module.exports = router;

