/**
 * Activity Service
 * 
 * Logic for recording and retrieving audit logs.
 * Design Principle: "Fire and Forget" logging to prevent blocking main flows.
 * Flow 9 - Activity Logs
 */

const ActivityLog = require('../models/ActivityLog');

/**
 * Record a new activity log
 * Non-blocking: Errors are caught and logged but don't crash the main process.
 */
function logActivity({ userId, action, resourceType, resourceId, details, req }) {
  // Extract info from request if provided
  const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '0.0.0.0';
  const userAgent = req?.headers?.['user-agent'] || 'unknown';

  // Fire and forget - no 'await'
  ActivityLog.create({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
    userAgent
  }).catch(err => {
    console.error(`[ActivityService] Failed to record log: ${err.message}`);
  });
}

/**
 * Get activity logs with filtering and pagination
 * 
 * @param {object} filters - userId, action, resourceType
 * @param {object} pagination - page, limit
 * @returns {Promise<object>}
 */
async function getActivities(filters = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ActivityLog.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email role')
      .lean(),
    ActivityLog.countDocuments(filters)
  ]);

  return {
    items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / limit)
    }
  };
}

module.exports = {
  logActivity,
  getActivities
};

