/**
 * Item Controller
 * 
 * Handles HTTP requests for item operations.
 * Delegates business logic to itemService.
 * Uses validation service for 5-layer validation.
 */

const itemService = require('../services/itemService');
const mongoose = require('mongoose');

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
    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Extract item data from form fields
    const itemData = extractItemData(req.body);
    
    // Get file from multer (stored in memory buffer)
    const file = req.file || null;

    // Create item using service (includes all validation layers)
    const item = await itemService.createItem(itemData, file, userId);

    // Format response according to PRD
    const responseData = formatItemResponse(item);

    // Return success response (201 Created)
    return res.status(201).json({
      status: 'success',
      message: 'Item created successfully',
      data: responseData,
      item_id: item._id.toString()
    });

  } catch (error) {
    // Handle validation errors from validation service
    if (error.statusCode && error.layer) {
      // Special handling for 409 (duplicate detection)
      const errorCode = error.statusCode === 409 ? 'CONFLICT_ERROR' : error.statusCode;
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: errorCode,
        error_type: getErrorType(error.statusCode, error.layer),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle validation service duplicate detection error (Layer 5)
    if (error.statusCode === 409) {
      return res.status(409).json({
        status: 'error',
        error_code: 'CONFLICT_ERROR',
        error_type: 'Conflict - Duplicate item',
        message: error.message || 'Item with same name and category already exists',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle MongoDB duplicate key error (database constraint - fallback)
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        error_code: 'CONFLICT_ERROR',
        error_type: 'Conflict - Duplicate item',
        message: 'Item with same name and category already exists',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Schema validation failed',
        message: Object.values(error.errors)[0]?.message || 'Validation failed',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error - pass to error handler
    next(error);
  }
}

/**
 * Extract and parse item data from form fields
 * 
 * @param {object} body - Request body
 * @returns {object} Parsed item data
 */
function extractItemData(body) {
  // Parse tags if provided (can be array or comma-separated string)
  let tags = undefined; // Use undefined to distinguish between "not provided" and "empty array"
  if ('tags' in body) { // Check if tags key exists (even if empty array)
    if (Array.isArray(body.tags)) {
      tags = body.tags; // Include empty arrays
    } else if (typeof body.tags === 'string') {
      tags = body.tags.split(',').map(t => t.trim()).filter(t => t);
    }
  }

  // Parse dimensions if provided (can be nested object or separate fields)
  let dimensions = undefined;
  
  // Helper to safely parse dimension value
  const parseDimension = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  // Check if dimensions provided as nested object first
  if (body.dimensions && typeof body.dimensions === 'object' && !Array.isArray(body.dimensions)) {
    dimensions = {
      length: parseDimension(body.dimensions.length),
      width: parseDimension(body.dimensions.width),
      height: parseDimension(body.dimensions.height)
    };
  } 
  // Otherwise check for separate fields (only if dimensions object wasn't found)
  else if (body.length !== undefined || body.width !== undefined || body.height !== undefined) {
    dimensions = {
      length: parseDimension(body.length),
      width: parseDimension(body.width),
      height: parseDimension(body.height)
    };
  }

  const extracted = {
    name: body.name,
    description: body.description,
    item_type: body.item_type,
    price: body.price !== undefined && body.price !== null ? parseFloat(body.price) : undefined,
    category: body.category,
    tags: tags !== undefined ? tags : undefined, // Preserve empty arrays, use undefined if not provided
    // Conditional fields
    weight: body.weight !== undefined && body.weight !== null ? parseFloat(body.weight) : undefined,
    dimensions: dimensions,
    download_url: body.download_url,
    file_size: body.file_size !== undefined && body.file_size !== null ? parseFloat(body.file_size) : undefined,
    duration_hours: body.duration_hours !== undefined && body.duration_hours !== null ? parseInt(body.duration_hours) : undefined,
    // Optional fields
    embed_url: body.embed_url || undefined
  };
  
  return extracted;
}

/**
 * Format item response according to PRD
 * Removes internal normalized fields
 * 
 * @param {object} item - Item document
 * @returns {object} Formatted item data
 */
function formatItemResponse(item) {
  const itemObj = item.toObject ? item.toObject() : item;
  
  // Remove internal fields (already handled by model's toJSON transform)
  // But ensure we have the right structure
  return itemObj;
}

/**
 * Get error type string based on status code and layer
 * 
 * @param {number} statusCode - HTTP status code
 * @param {number} layer - Validation layer
 * @returns {string} Error type description
 */
function getErrorType(statusCode, layerOrDetail) {
  // Handle 409 conflicts with different error types
  if (statusCode === 409 && layerOrDetail) {
    const conflictTypes = {
      'VERSION_CONFLICT': 'Conflict - Version mismatch',
      'ITEM_DELETED': 'Conflict - Item deleted',
      'ITEM_INACTIVE': 'Conflict - Item inactive',
      'DUPLICATE': 'Conflict - Duplicate item'
    };
    return conflictTypes[layerOrDetail] || 'Conflict';
  }

  const errorTypes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    404: 'Not Found - Resource not found',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    422: 'Unprocessable Entity - Schema validation failed',
    409: 'Conflict - Duplicate item'
  };
  
  return errorTypes[statusCode] || 'Error';
}

/**
 * Get default error message based on status code
 * 
 * @param {number} statusCode - HTTP status code
 * @returns {string} Default error message
 */
function getDefaultErrorMessage(statusCode) {
  const messages = {
    401: 'Authentication required',
    413: 'File size exceeds limit',
    415: 'File type not allowed',
    422: 'Validation failed',
    400: 'Business rule validation failed',
    409: 'Duplicate item detected'
  };
  
  return messages[statusCode] || 'An error occurred';
}

/**
 * Get all items with search, filter, sort, and pagination
 * GET /api/v1/items
 * Implements Flow 3 requirements
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getItems(req, res, next) {
  try {
    // Get user ID from authenticated request (set by authMiddleware)
    // CRITICAL: This ensures users can only see their own items
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // ========== QUERY PARAMETER VALIDATION ==========
    
    // 1. Validate and parse page parameter
    let page = 1;
    if (req.query.page !== undefined) {
      const pageValue = parseInt(req.query.page);
      if (isNaN(pageValue) || pageValue < 1) {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Invalid query parameter',
          message: 'Page must be a positive integer >= 1',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      page = pageValue;
    }
    
    // 2. Validate and parse limit parameter
    let limit = 20;
    if (req.query.limit !== undefined) {
      const limitValue = parseInt(req.query.limit);
      if (isNaN(limitValue) || limitValue < 1 || limitValue > 100) {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Invalid query parameter',
          message: 'Limit must be an integer between 1 and 100',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      limit = limitValue;
    }
    
    // 3. Validate sort_order enum values
    let sort_order = ['desc'];
    if (req.query.sort_order) {
      const validSortOrders = ['asc', 'desc'];
      
      // Handle both single value and array
      const sortOrders = Array.isArray(req.query.sort_order) 
        ? req.query.sort_order 
        : [req.query.sort_order];
      
      // Check if all values are valid
      const invalidOrder = sortOrders.find(order => !validSortOrders.includes(order));
      if (invalidOrder) {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Invalid query parameter',
          message: `sort_order must be "asc" or "desc", got "${invalidOrder}"`,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      sort_order = sortOrders;
    }
    
    // 4. Parse and validate status parameter
    const search = req.query.search || null;
    const status = req.query.status && ['active', 'inactive'].includes(req.query.status) 
      ? req.query.status 
      : null;
    
    // Reject invalid status values
    if (req.query.status && !['active', 'inactive'].includes(req.query.status)) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Invalid query parameter',
        message: `status must be "active" or "inactive", got "${req.query.status}"`,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
    
    const category = req.query.category || null;
    
    // 5. Handle sort_by - can be array or single value (no enum validation needed)
    let sort_by = ['createdAt'];
    if (req.query.sort_by) {
      if (Array.isArray(req.query.sort_by)) {
        sort_by = req.query.sort_by;
      } else {
        sort_by = [req.query.sort_by];
      }
    }

    // Build filters object
    const filters = {
      search,
      status,
      category,
      sort_by,
      sort_order,
      page,
      limit
    };

    // Get items from service - pass userId and role for data isolation
    const result = await itemService.getItems(filters, userId, req.user.role);

    // Check if page needs redirection (page > totalPages)
    if (page > result.pagination.total_pages && result.pagination.total_pages > 0) {
      // Redirect to last valid page
      const redirectParams = new URLSearchParams(req.query);
      redirectParams.set('page', result.pagination.total_pages.toString());
      return res.redirect(`${req.path}?${redirectParams.toString()}`);
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      items: result.items,
      pagination: result.pagination
    });

  } catch (error) {
    // Handle authentication errors silently for auto-refresh
    if (error.statusCode === 401 && req.headers['x-auto-refresh'] === 'true') {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication expired',
        silent: true
      });
    }

    // Handle other errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error
    next(error);
  }
}

/**
 * Get single item by ID (Flow 4)
 * GET /api/v1/items/:id
 * 
 * PRD Reference: Flow 4 - Item Details (Section 9)
 * Error responses must match PRD exactly:
 * - 422: Invalid ID format
 * - 404: Item not found
 * - 401: Unauthorized (handled by middleware)
 * - 500: Internal server error
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getItem(req, res, next) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  try {
    const itemId = req.params.id;
    // Flow 4: Any authenticated user can view any active item (no user filtering)
    // Pass null to service to avoid filtering by created_by

    // Validate item ID format (PRD Section 9: 422 Unprocessable Entity)
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Invalid ID format',
        message: 'Invalid item ID format',
        timestamp: timestamp,
        path: path
      });
    }

    // Get item from service (no user filtering - any authenticated user can view)
    // Include inactive items so View button works for deleted items
    // Pass role to allow Admin to bypass any hidden filters
    const item = await itemService.getItemById(itemId, null, true, req.user?.role);

    // Handle not found (PRD Section 9: 404 Not Found)
    if (!item) {
      return res.status(404).json({
        status: 'error',
        error_code: 404,
        error_type: 'Not Found - Resource not found',
        message: `Item with ID ${itemId} not found`,
        timestamp: timestamp,
        path: path
      });
    }

    // Format and return item (PRD Section 9: Success Response)
    const formattedItem = formatItemResponse(item);

    return res.status(200).json({
      status: 'success',
      message: 'Item retrieved successfully',
      data: formattedItem
    });

  } catch (error) {
    // Handle known errors with statusCode
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: timestamp,
        path: path
      });
    }

    // Handle 500 Internal Server Error (PRD Section 9)
    console.error('Error retrieving item:', error);
    return res.status(500).json({
      status: 'error',
      error_code: 500,
      error_type: 'Internal Server Error',
      message: 'An unexpected error occurred while retrieving the item',
      timestamp: timestamp,
      path: path
    });
  }
}

/**
 * Update an existing item (Flow 5)
 * PUT /api/v1/items/:id
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function updateItem(req, res, next) {
  try {
    const itemId = req.params.id;
    const userId = req.user?.id || req.user?.userId; // Support both id and userId
    const userRole = req.user?.role;
    const file = req.file || null;

    // Validate item ID format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Invalid item ID format. Expected 24-character hexadecimal string.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Extract version from request body (required)
    // Parse version from string (FormData sends everything as strings) to number
    const providedVersion = req.body.version !== undefined && req.body.version !== null
      ? parseInt(req.body.version, 10)
      : undefined;

    // Extract item data from request body (exclude version from itemData)
    const itemData = extractItemData(req.body);
    delete itemData.version; // Remove version from itemData, handled separately

    // Update item via service
    const updatedItem = await itemService.updateItem(itemId, itemData, file, userId, providedVersion, userRole);

    // Format and return updated item
    const formattedItem = formatItemResponse(updatedItem);

    return res.status(200).json({
      status: 'success',
      message: 'Item updated successfully',
      data: formattedItem
    });

  } catch (error) {
    if (error.statusCode) {
      const errorResponse = {
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode, error.errorCodeDetail),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      };

      // Add error_code_detail for 409 conflicts
      if (error.statusCode === 409 && error.errorCodeDetail) {
        errorResponse.error_code_detail = error.errorCodeDetail;
      }

      // Add version info for VERSION_CONFLICT
      if (error.errorCodeDetail === 'VERSION_CONFLICT') {
        errorResponse.current_version = error.currentVersion;
        errorResponse.provided_version = error.providedVersion;
      }

      return res.status(error.statusCode).json(errorResponse);
    }
    next(error);
  }
}

/**
 * Delete an item (soft delete) (Flow 6)
 * DELETE /api/v1/items/:id
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
/**
 * Delete an item (soft delete) (Flow 6)
 * DELETE /api/v1/items/:id
 * 
 * PRD Reference: Flow 6 - Item Delete (Section 8)
 * Error responses must match PRD exactly:
 * - 400: Invalid ID format
 * - 401: Unauthorized (handled by middleware)
 * - 404: Item not found or not owned
 * - 409: Item already deleted
 * - 500: Internal server error
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function deleteItem(req, res, next) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  try {
    const itemId = req.params.id;
    // PRD Section 6.3: Ownership validation - authMiddleware sets req.user.id
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized - Authentication required',
        message: 'Authentication required. Please log in.',
        timestamp: timestamp,
        path: path
      });
    }

    // PRD Section 8: Validate item ID format (400 Bad Request)
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid item ID format. Expected 24-character hexadecimal string.',
        timestamp: timestamp,
        path: path
      });
    }

    // PRD Section 6.2 & 6.3: Delete item via service (ownership + soft delete)
    const deletedItem = await itemService.deleteItem(itemId, userId, req.user?.role);

    // PRD Section 8: Format and return deleted item (200 OK)
    const formattedItem = formatItemResponse(deletedItem);

    return res.status(200).json({
      status: 'success',
      message: 'Item deleted successfully',
      data: formattedItem
    });

  } catch (error) {
    // PRD Section 8: Handle known errors with statusCode
    if (error.statusCode) {
      const errorResponse = {
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: timestamp,
        path: path
      };

      // PRD Section 8: Add error_code_detail for 409 Conflict
      if (error.statusCode === 409 && error.errorCodeDetail) {
        errorResponse.error_code_detail = error.errorCodeDetail;
      }

      return res.status(error.statusCode).json(errorResponse);
    }

    // PRD Section 8: Handle 500 Internal Server Error
    return res.status(500).json({
      status: 'error',
      error_code: 500,
      error_type: 'Internal Server Error',
      message: 'Something went wrong. Please try again.',
      timestamp: timestamp,
      path: path
    });
  }
}

/**
 * Activate (restore) a deleted item (Flow 6 extension)
 * PATCH /api/v1/items/:id/activate
 * 
 * Restores a soft-deleted item by setting is_active to true and clearing deleted_at
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function activateItem(req, res, next) {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  try {
    const itemId = req.params.id;
    // Ownership validation - authMiddleware sets req.user.id
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized - Authentication required',
        message: 'Authentication required. Please log in.',
        timestamp: timestamp,
        path: path
      });
    }

    // Validate item ID format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid item ID format. Expected 24-character hexadecimal string.',
        timestamp: timestamp,
        path: path
      });
    }

    // Activate item via service
    const activatedItem = await itemService.activateItem(itemId, userId, req.user?.role);

    // Format and return activated item
    const formattedItem = formatItemResponse(activatedItem);

    return res.status(200).json({
      status: 'success',
      message: 'Item activated successfully',
      data: formattedItem
    });

  } catch (error) {
    // Handle known errors with statusCode
    if (error.statusCode) {
      const errorResponse = {
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: timestamp,
        path: path
      };

      // Add error_code_detail for 409 Conflict
      if (error.statusCode === 409 && error.errorCodeDetail) {
        errorResponse.error_code_detail = error.errorCodeDetail;
      }

      return res.status(error.statusCode).json(errorResponse);
    }

    // Handle 500 Internal Server Error
    return res.status(500).json({
      status: 'error',
      error_code: 500,
      error_type: 'Internal Server Error',
      message: 'Something went wrong. Please try again.',
      timestamp: timestamp,
      path: path
    });
  }
}

/**
 * Create items in batch
 * POST /api/v1/items/batch
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function createItemsBatch(req, res, next) {
  try {
    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate request body
    if (!req.body || !req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Request body must contain an "items" array',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate array length (max 50 items to prevent abuse)
    if (req.body.items.length > 50) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Validation error',
        message: 'Maximum 50 items allowed per batch request',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate skip_existing flag
    const skipExisting = req.body.skip_existing === true;

    // Extract item data for each item (same as single create endpoint)
    // This converts length/width/height to dimensions object, parses tags, etc.
    const extractedItems = req.body.items.map(item => extractItemData(item));

    // Process batch via service
    const result = await itemService.createItemsBatch(extractedItems, skipExisting, userId);

    // Return success response
    return res.status(200).json({
      status: 'success',
      created: result.created,
      skipped: result.skipped,
      failed: result.failed,
      results: result.results,
      errors: result.errors
    });

  } catch (error) {
    // Handle authentication errors silently for auto-refresh
    if (error.statusCode === 401 && req.headers['x-auto-refresh'] === 'true') {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication expired',
        silent: true
      });
    }

    // Handle other errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error
    next(error);
  }
}

/**
 * Check if items exist
 * POST /api/v1/items/check-exists
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function checkItemsExist(req, res, next) {
  try {
    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate request body
    if (!req.body || !req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request',
        message: 'Request body must contain an "items" array',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate array length (max 100 items to prevent abuse)
    if (req.body.items.length > 100) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Validation error',
        message: 'Maximum 100 items allowed per request',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Validate each item has required fields
    for (let i = 0; i < req.body.items.length; i++) {
      const item = req.body.items[i];
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Validation error',
          message: `Item at index ${i} must have a non-empty "name" field`,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      if (!item.category || typeof item.category !== 'string' || item.category.trim() === '') {
        return res.status(422).json({
          status: 'error',
          error_code: 422,
          error_type: 'Unprocessable Entity - Validation error',
          message: `Item at index ${i} must have a non-empty "category" field`,
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
    }

    // Check items existence via service
    const results = await itemService.checkItemsExist(req.body.items, userId, req.user.role);

    // Calculate missing count
    const missingCount = results.filter(r => !r.exists).length;

    // Return success response
    return res.status(200).json({
      status: 'success',
      results: results,
      missing_count: missingCount
    });

  } catch (error) {
    // Handle authentication errors silently for auto-refresh
    if (error.statusCode === 401 && req.headers['x-auto-refresh'] === 'true') {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication expired',
        silent: true
      });
    }

    // Handle other errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error
    next(error);
  }
}

/**
 * Get seed status for a user
 * GET /api/v1/items/seed-status/:userId
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getSeedStatus(req, res, next) {
  try {
    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Extract userId from params
    const targetUserId = req.params.userId;
    
    // Validate userId format (ObjectId)
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        status: 'error',
        error_code: 400,
        error_type: 'Bad Request - Invalid ID format',
        message: 'Invalid user ID format. Expected 24-character hexadecimal string.',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Extract seed_version from query (optional)
    const seedVersion = req.query.seed_version || null;

    // Get seed status from service
    const result = await itemService.getSeedStatus(targetUserId, seedVersion, req.user.role);

    // Return success response
    return res.status(200).json({
      status: 'success',
      seed_complete: result.seed_complete,
      total_items: result.total_items,
      required_count: result.required_count,
      missing_items: result.missing_items,
      seed_version: result.seed_version
    });

  } catch (error) {
    // Handle authentication errors silently for auto-refresh
    if (error.statusCode === 401 && req.headers['x-auto-refresh'] === 'true') {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication expired',
        silent: true
      });
    }

    // Handle other errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error
    next(error);
  }
}

/**
 * Get count of items
 * GET /api/v1/items/count
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
async function getItemCount(req, res, next) {
  try {
    // Get user ID from authenticated request (set by authMiddleware)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Parse and validate query parameters (same validation as getItems)
    const search = req.query.search || null;
    const status = req.query.status && ['active', 'inactive'].includes(req.query.status) 
      ? req.query.status 
      : null;
    
    // Reject invalid status values
    if (req.query.status && !['active', 'inactive'].includes(req.query.status)) {
      return res.status(422).json({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity - Invalid query parameter',
        message: `status must be "active" or "inactive", got "${req.query.status}"`,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
    
    const category = req.query.category || null;

    // Build filters object
    const filters = {
      search,
      status,
      category
    };

    // Get count from service - pass userId and role for data isolation
    const result = await itemService.getItemCount(filters, userId, req.user.role);

    // Return success response
    return res.status(200).json({
      status: 'success',
      count: result.count,
      filters: {
        status: status || null,
        category: category || null,
        search: search || null
      }
    });

  } catch (error) {
    // Handle authentication errors silently for auto-refresh
    if (error.statusCode === 401 && req.headers['x-auto-refresh'] === 'true') {
      return res.status(401).json({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized',
        message: 'Authentication expired',
        silent: true
      });
    }

    // Handle other errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        error_code: error.statusCode,
        error_type: getErrorType(error.statusCode),
        message: error.message || getDefaultErrorMessage(error.statusCode),
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }

    // Generic error
    next(error);
  }
}

module.exports = {
  createItem,
  getItems,
  getItemCount,
  checkItemsExist,
  createItemsBatch,
  getSeedStatus,
  getItem,
  updateItem,
  deleteItem,
  activateItem
};

