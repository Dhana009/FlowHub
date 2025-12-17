/**
 * Activity Controller
 * 
 * Handles HTTP requests for audit logs.
 * Flow 9 - Activity Logs
 */

const activityService = require('../services/activityService');

/**
 * Get activity logs
 * GET /api/v1/activities
 */
async function getActivities(req, res, next) {
  try {
    const { user } = req;
    const { page = 1, limit = 20, action, resourceType } = req.query;

    const filters = {};
    
    // RBAC: Non-admins only see their own logs
    if (user.role !== 'ADMIN') {
      filters.userId = user.id;
    }

    // Optional filters
    if (action) filters.action = action;
    if (resourceType) filters.resourceType = resourceType;

    const result = await activityService.getActivities(filters, { page, limit });

    res.status(200).json({
      status: 'success',
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActivities
};

