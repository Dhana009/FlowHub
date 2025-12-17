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

/**
 * POST /api/v1/items
 * Create a new item
 * Requires authentication
 * Supports file upload
 */
router.post(
  '/',
  verifyToken, // Authentication required
  handleFileUpload, // Handle file upload (optional)
  itemController.createItem
);

/**
 * GET /api/v1/items
 * Get all items with search, filter, sort, and pagination
 * Requires authentication (Flow 3)
 */
router.get('/', verifyToken, itemController.getItems);

/**
 * GET /api/v1/items/:id
 * Get single item by ID (Flow 4)
 * Requires authentication
 */
router.get('/:id', verifyToken, itemController.getItem);

/**
 * PUT /api/v1/items/:id
 * Update an existing item (Flow 5)
 * Requires authentication
 * Supports file upload (optional, for file replacement)
 */
router.put(
  '/:id',
  verifyToken, // Authentication required
  handleFileUpload, // Handle file upload (optional)
  itemController.updateItem
);

/**
 * DELETE /api/v1/items/:id
 * Delete an item (soft delete) (Flow 6)
 * Requires authentication
 */
router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;

