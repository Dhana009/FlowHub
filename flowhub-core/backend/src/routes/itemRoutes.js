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
 * Get all items (to be implemented in Flow 3)
 */
router.get('/', itemController.getItems);

/**
 * GET /api/v1/items/:id
 * Get single item by ID (to be implemented in Flow 4)
 */
router.get('/:id', itemController.getItem);

module.exports = router;

