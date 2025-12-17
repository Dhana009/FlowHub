/**
 * Item Controller
 * 
 * Handles HTTP requests for item operations.
 * Delegates business logic to itemService.
 */

const itemService = require('../services/itemService');
const { sendErrorResponse, handleMongooseError } = require('../utils/errorResponse');
const path = require('path');

/**
 * Create a new item
 * POST /api/v1/items
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function createItem(req, res, next) {
  try {
    // Parse item_data from form field (JSON string)
    let itemData;
    try {
      itemData = JSON.parse(req.body.item_data || '{}');
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid item_data format. Must be valid JSON.',
        statusCode: 400
      });
    }

    // Validate required fields
    if (!itemData.name || !itemData.description || !itemData.item_type || 
        !itemData.price || !itemData.category) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, item_type, price, category',
        statusCode: 400
      });
    }

    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        statusCode: 401
      });
    }

    // Prepare file metadata if file was uploaded
    let fileMetadata = null;
    if (req.file) {
      // Get relative path from uploads directory
      const relativePath = path.relative(
        path.join(__dirname, '../../'),
        req.file.path
      ).replace(/\\/g, '/'); // Normalize path separators

      fileMetadata = {
        path: relativePath,
        original_name: req.fileMetadata.original_name,
        content_type: req.fileMetadata.content_type,
        size: req.fileMetadata.size
      };
    }

    // Create item using service
    const item = await itemService.createItem(itemData, userId, fileMetadata);

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Item created successfully',
      data: item,
      item_id: item._id.toString()
    });

  } catch (error) {
    // Handle file cleanup on error
    if (req.file && req.file.path) {
      await itemService.cleanupFileOnError(req.file.path);
    }

    // Handle Mongoose errors
    if (error.name === 'ValidationError' || error.code === 11000) {
      const mongooseError = handleMongooseError(error);
      return sendErrorResponse(res, mongooseError);
    }

    // Handle service errors (business rules, duplicates)
    if (error.statusCode) {
      return sendErrorResponse(res, error);
    }

    // Generic error
    next(error);
  }
}

/**
 * Get all items (for future use - Flow 3)
 * GET /api/v1/items
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getItems(req, res, next) {
  try {
    // This will be implemented in Flow 3
    res.status(200).json({
      status: 'success',
      message: 'Get items endpoint - to be implemented in Flow 3',
      data: []
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single item by ID (for future use - Flow 4)
 * GET /api/v1/items/:id
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getItem(req, res, next) {
  try {
    // This will be implemented in Flow 4
    res.status(200).json({
      status: 'success',
      message: 'Get item endpoint - to be implemented in Flow 4',
      data: null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createItem,
  getItems,
  getItem
};

