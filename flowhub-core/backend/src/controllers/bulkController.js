/**
 * Bulk Controller
 * 
 * Handles HTTP requests for bulk operations.
 * Flow 7 - Bulk Operations
 */

const bulkService = require('../services/bulkService');

/**
 * Start a bulk operation
 * POST /api/v1/bulk-operations
 */
async function startBulkOperation(req, res, next) {
  try {
    const { operation, itemIds, payload } = req.body;
    const userId = req.user.id;

    if (!operation || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        message: 'Operation and non-empty itemIds array are required'
      });
    }

    const job = await bulkService.createJob(userId, operation, itemIds, payload);

    res.status(201).json({
      status: 'success',
      job_id: job._id,
      job_status: job.status,
      job_progress: job.progress,
      total_items: job.totalItems
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Poll bulk job status (includes lazy processing)
 * GET /api/v1/bulk-operations/:jobId
 */
async function getBulkJobStatus(req, res, next) {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // processNextBatch performs the lazy processing and returns updated job
    const job = await bulkService.processNextBatch(jobId, userId);

    res.status(200).json({
      status: 'success',
      data: {
        job_id: job._id,
        status: job.status,
        progress: job.progress,
        summary: {
          total: job.totalItems,
          success: job.processedIds.length,
          failed: job.failedItems.length
        },
        skippedIds: job.skippedIds,
        failures: job.failedItems
      }
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'error',
        error_code: 404,
        message: error.message
      });
    }
    next(error);
  }
}

module.exports = {
  startBulkOperation,
  getBulkJobStatus
};

