/**
 * User Routes
 * 
 * API routes for Admin user management.
 * Flow 10 - User Management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// All user management routes require ADMIN role
router.use(verifyToken);
router.use(authorize(['ADMIN']));

/**
 * GET /api/v1/users
 * List all users
 */
router.get('/', userController.getUsers);

/**
 * PATCH /api/v1/users/:id/role
 * Change a user's role
 */
router.patch('/:id/role', userController.updateUserRole);

/**
 * PATCH /api/v1/users/:id/status
 * Activate or Deactivate a user account
 */
router.patch('/:id/status', userController.updateUserStatus);

/**
 * DELETE /api/v1/users/:id
 * Deactivate a user account (legacy/convenience)
 */
router.delete('/:id', userController.deactivateUser);

module.exports = router;

