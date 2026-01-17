/**
 * Internal Controller (Automation Hooks)
 * 
 * Handles requests for database resets, OTP retrieval, and seeding.
 * ONLY FOR USE IN DEVELOPMENT MODE.
 */

const internalService = require('../services/internalService');

/**
 * Protect against unauthorized internal calls
 */
function authorizeInternal(req, res) {
  const providedKey = req.headers['x-internal-key'];
  const secretKey = process.env.INTERNAL_AUTOMATION_KEY || 'flowhub-secret-automation-key-2025';

  if (!providedKey || providedKey !== secretKey) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing Internal Safety Key'
    });
    return false;
  }
  return true;
}

/**
 * POST /api/v1/internal/reset
 */
async function resetDB(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const result = await internalService.resetDatabase();
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/internal/otp
 */
async function getOTP(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email query param is required' });
    }
    const result = await internalService.getLatestOTP(email);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/internal/seed
 */
async function seedData(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const { userId, count } = req.body;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'userId is required' });
    }
    const result = await internalService.seedItems(userId, count);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/internal/users/:userId/data
 * Hard delete all data for a specific user (Items, BulkJobs, ActivityLogs, OTPs)
 * Preserves the User record itself
 */
async function cleanupUserData(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;

    const userId = req.params.userId;
    const mongoose = require('mongoose');

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid user ID format. Expected 24-character hexadecimal string.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Parse query parameters
    const include_otp = req.query.include_otp !== 'false'; // Default: true
    const include_activity_logs = req.query.include_activity_logs !== 'false'; // Default: true

    // Call service
    const result = await internalService.cleanupUserData(userId, {
      include_otp,
      include_activity_logs
    });

    // Return success response
    return res.status(200).json({
      status: 'success',
      deleted: result,
      preserved: {
        user: true
      }
    });

  } catch (error) {
    // Handle known errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'error',
        error_code: 404,
        error_type: 'Not Found',
        message: error.message || 'User not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle other errors
    next(error);
  }
}

/**
 * DELETE /api/v1/internal/users/:userId/items
 * Hard delete only items for a specific user (preserves BulkJobs, ActivityLogs, OTPs)
 * Preserves the User record itself
 */
async function cleanupUserItems(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;

    const userId = req.params.userId;
    const mongoose = require('mongoose');

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid user ID format. Expected 24-character hexadecimal string.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Call service
    const result = await internalService.cleanupUserItems(userId);

    // Return success response
    return res.status(200).json({
      status: 'success',
      deleted: result,
      preserved: {
        user: true,
        bulk_jobs: true,
        activity_logs: true,
        otps: true
      }
    });

  } catch (error) {
    // Handle known errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'error',
        error_code: 404,
        error_type: 'Not Found',
        message: error.message || 'User not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle other errors
    next(error);
  }
}

/**
 * DELETE /api/v1/internal/items/:id/permanent
 * Hard delete a single item by ID (removes from MongoDB)
 * Also deletes associated file from filesystem
 */
async function hardDeleteItem(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;

    const itemId = req.params.id;
    const mongoose = require('mongoose');

    // Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid item ID format. Expected 24-character hexadecimal string.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Call service
    const result = await internalService.hardDeleteItem(itemId);

    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Item permanently deleted',
      deleted: result
    });

  } catch (error) {
    // Handle known errors
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'error',
        error_code: 404,
        error_type: 'Not Found',
        message: error.message || 'Item not found',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: error.message || 'Invalid request',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle other errors
    next(error);
  }
}

module.exports = {
  resetDB,
  getOTP,
  seedData,
  cleanupUserData,
  cleanupUserItems,
  hardDeleteItem
};

