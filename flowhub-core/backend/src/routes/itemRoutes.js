/**
 * Item Routes
 * 
 * Defines all item-related API routes.
 */

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { handleFileUpload } = require('../middleware/upload');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

/**
 * POST /api/v1/items
 * Create a new item
 * Requires authentication
 * Roles: ADMIN, EDITOR
 * Supports file upload
 */
router.post(
  '/',
  verifyToken, // Authentication required
  authorize(['ADMIN', 'EDITOR']), // Only Admin and Editor can create
  handleFileUpload, // Handle file upload (optional)
  itemController.createItem
);

/**
 * GET /api/v1/items
 * Get all items with search, filter, sort, and pagination
 * Requires authentication (Flow 3)
 * Roles: ADMIN, EDITOR, VIEWER
 */
router.get('/', verifyToken, authorize(['ADMIN', 'EDITOR', 'VIEWER']), itemController.getItems);

/**
 * PATCH /api/v1/items/:id/activate
 * Activate (restore) a deleted item (Flow 6 extension)
 * Requires authentication
 * Roles: ADMIN, EDITOR (ownership check)
 * NOTE: Must be defined BEFORE /:id route to avoid route matching conflicts
 */
router.patch(
  '/:id/activate', 
  verifyToken, 
  authorize(['ADMIN', 'EDITOR'], { requireOwnership: true, modelName: 'Item' }),
  itemController.activateItem
);

/**
 * GET /api/v1/items/:id
 * Get single item by ID (Flow 4)
 * Requires authentication
 * Roles: ADMIN, EDITOR, VIEWER
 */
router.get('/:id', verifyToken, authorize(['ADMIN', 'EDITOR', 'VIEWER']), itemController.getItem);

/**
 * PUT /api/v1/items/:id
 * Update an existing item (Flow 5)
 * Requires authentication
 * Roles: ADMIN, EDITOR (ownership check)
 * Supports file upload (optional, for file replacement)
 */
router.put(
  '/:id',
  verifyToken, // Authentication required
  authorize(['ADMIN', 'EDITOR'], { requireOwnership: true, modelName: 'Item' }),
  handleFileUpload, // Handle file upload (optional)
  itemController.updateItem
);

/**
 * DELETE /api/v1/items/:id
 * Delete an item (soft delete) (Flow 6)
 * Requires authentication
 * Roles: ADMIN, EDITOR (ownership check)
 */
router.delete(
  '/:id', 
  verifyToken, 
  authorize(['ADMIN', 'EDITOR'], { requireOwnership: true, modelName: 'Item' }),
  itemController.deleteItem
);

module.exports = router;

