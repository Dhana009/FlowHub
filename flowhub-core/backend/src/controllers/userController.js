/**
 * User Controller
 * 
 * Handles HTTP requests for user management (Admin only).
 * Flow 10 - User Management
 */

const userService = require('../services/userService');

/**
 * Get all users
 * GET /api/v1/users
 */
async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.getAllUsers({ page, limit });

    res.status(200).json({
      status: 'success',
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user role
 * PATCH /api/v1/users/:id/role
 */
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUserId = req.user.id;

    const user = await userService.updateUserRole(adminUserId, id, role, req);

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate user
 * DELETE /api/v1/users/:id
 */
async function deactivateUser(req, res, next) {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    // Prevent self-deactivation
    if (adminUserId === id) {
      return res.status(403).json({
        status: 'error',
        message: 'Security Block: You cannot deactivate your own administrative account'
      });
    }

    await userService.updateUserStatus(adminUserId, id, false, req);

    res.status(200).json({
      status: 'success',
      message: 'User account deactivated'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user status (activate/deactivate)
 * PATCH /api/v1/users/:id/status
 */
async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminUserId = req.user.id;

    // Prevent self-deactivation
    if (adminUserId === id && isActive === false) {
      return res.status(403).json({
        status: 'error',
        message: 'Security Block: You cannot deactivate your own administrative account'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isActive (boolean) is required'
      });
    }

    await userService.updateUserStatus(adminUserId, id, isActive, req);

    res.status(200).json({
      status: 'success',
      message: `User account ${isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  deactivateUser,
  updateUserStatus
};

