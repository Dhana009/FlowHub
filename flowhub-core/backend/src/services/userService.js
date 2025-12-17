/**
 * User Service
 * 
 * Business logic for user management (Admin actions).
 * Flow 10 - User Management
 */

const User = require('../models/User');
const activityService = require('./activityService');

/**
 * Get all users with pagination
 */
async function getAllUsers(pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({})
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

/**
 * Update user role
 */
async function updateUserRole(adminUserId, targetUserId, newRole, req) {
  const allowedRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
  if (!allowedRoles.includes(newRole)) {
    throw new Error('Invalid role specified');
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const oldRole = user.role;
  user.role = newRole;
  user.roleChangedAt = new Date();
  await user.save();

  // Log activity (Flow 9)
  activityService.logActivity({
    userId: adminUserId,
    action: 'ITEM_UPDATED', // Reusing action or should add USER_ROLE_UPDATED
    resourceType: 'USER',
    resourceId: targetUserId,
    details: { oldRole, newRole, targetEmail: user.email },
    req
  });

  return user;
}

/**
 * Update user status (activate/deactivate)
 */
async function updateUserStatus(adminUserId, targetUserId, isActive, req) {
  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = isActive;
  await user.save();

  // Log activity (Flow 9)
  activityService.logActivity({
    userId: adminUserId,
    action: isActive ? 'ITEM_ACTIVATED' : 'ITEM_DEACTIVATED',
    resourceType: 'USER',
    resourceId: targetUserId,
    details: { targetEmail: user.email },
    req
  });

  return user;
}

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus
};

