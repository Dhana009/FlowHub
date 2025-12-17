/**
 * Item Service
 * 
 * Contains all business logic for item operations.
 * Integrates with validation service and file service.
 * No HTTP concerns - pure business logic.
 */

const Item = require('../models/Item');
const { validateItemCreation } = require('./validationService');
const fileService = require('./fileService');
const categoryService = require('./categoryService');
const { withTransaction } = require('../utils/transactionHelper');

/**
 * Create a new item with full validation and file upload support
 * Uses two-phase commit for file uploads
 * 
 * @param {object} itemData - Item data
 * @param {object} file - Multer file object (optional)
 * @param {string} userId - User ID creating the item
 * @returns {Promise<object>} - Created item
 * @throws {Error} - If creation fails (with statusCode and layer)
 */
async function createItem(itemData, file, userId) {
  let tempFileInfo = null;

  try {
    // Validate through all layers (stops at first failure)
    await validateItemCreation(itemData, file, userId);

    // Phase 1: Upload file to temp location (if file provided)
    if (file) {
      tempFileInfo = await fileService.uploadToTemp(file, userId);
    }

    // Phase 2: Create item within transaction
    const result = await withTransaction(async (session) => {
      // Normalize category
      const normalizedCategory = categoryService.normalizeCategory(itemData.category);
      
      // Prepare normalized name for duplicate detection
      const normalizedName = itemData.name.toLowerCase().trim();
      const nameLength = normalizedName.length;
      let normalizedNamePrefix;
      if (nameLength <= 2) {
        normalizedNamePrefix = normalizedName;
      } else if (nameLength <= 4) {
        normalizedNamePrefix = normalizedName.substring(0, nameLength - 1);
      } else {
        normalizedNamePrefix = normalizedName.substring(0, 5);
      }
      
      // Prepare item data
      const itemToCreate = {
        ...itemData,
        category: normalizedCategory, // Store normalized Title Case
        normalizedCategory: normalizedCategory, // Required field - set explicitly
        normalizedName: normalizedName, // Required field - set explicitly
        normalizedNamePrefix: normalizedNamePrefix, // Required field - set explicitly
        created_by: userId,
        is_active: true
      };

      // Create item (pre-save hook will handle additional normalization)
      // If session is null (transactions not supported), create without session
      const item = session 
        ? await Item.create([itemToCreate], { session })
        : await Item.create([itemToCreate]);
      const createdItem = item[0];

      // Phase 3: Commit file upload (move to permanent location)
      if (tempFileInfo) {
        const permanentPath = await fileService.commitFileUpload(
          tempFileInfo.tempFilePath,
          createdItem._id.toString()
        );
        createdItem.file_path = permanentPath;
        await createdItem.save(session ? { session } : {});
      }

      return createdItem;
    });

    return result;

  } catch (error) {
    // Rollback: Clean up temp file if it exists
    if (tempFileInfo && tempFileInfo.tempFilePath) {
      await fileService.rollbackFileUpload(tempFileInfo.tempFilePath);
    }
    
    // Re-throw error (will be handled by controller)
    throw error;
  }
}

/**
 * Get item by ID
 * 
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID (optional, for ownership check)
 * @returns {Promise<object|null>} - Item or null if not found
 */
async function getItemById(itemId, userId = null) {
  const query = { _id: itemId, is_active: true };
  if (userId) {
    query.created_by = userId;
  }
  return await Item.findOne(query);
}

/**
 * Get items by user
 * 
 * @param {string} userId - User ID
 * @param {object} options - Query options (limit, skip, sort)
 * @returns {Promise<object>} - Items and pagination info
 */
async function getItemsByUser(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  const query = { created_by: userId, is_active: true };

  const [items, total] = await Promise.all([
    Item.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean(),
    Item.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total
    }
  };
}

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  await fileService.deleteFile(filePath);
}

/**
 * Escape special regex characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Normalize search query (same as Flow 2)
 * @param {string} query - Search query
 * @returns {string|null} Normalized query or null if empty
 */
function normalizeSearchQuery(query) {
  if (!query || query === null || query === undefined || query.toString().trim() === '') {
    return null;
  }
  return query.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Validate and clean sort fields
 * @param {array} sortBy - Array of sort fields
 * @returns {array} Validated and deduplicated sort fields
 */
function validateSortFields(sortBy) {
  const allowedFields = ['name', 'category', 'price', 'createdAt'];
  
  if (!Array.isArray(sortBy)) {
    return ['createdAt'];
  }
  
  // Remove duplicates, keep first occurrence
  const seen = new Set();
  const validFields = sortBy
    .filter(field => {
      if (!allowedFields.includes(field) || seen.has(field)) {
        return false;
      }
      seen.add(field);
      return true;
    })
    .slice(0, 2); // Max 2 columns
  
  return validFields.length > 0 ? validFields : ['createdAt'];
}

/**
 * Build sort object for Mongoose
 * @param {array} sortBy - Array of sort fields
 * @param {array} sortOrder - Array of sort orders
 * @returns {object} Mongoose sort object
 */
function buildSortObject(sortBy, sortOrder) {
  const validatedFields = validateSortFields(sortBy);
  const sortObj = {};
  
  validatedFields.forEach((field, index) => {
    const order = sortOrder && sortOrder[index] === 'asc' ? 1 : -1;
    sortObj[field] = order;
  });
  
  return sortObj;
}

/**
 * Get items with search, filter, sort, and pagination
 * Implements Flow 3 requirements
 * 
 * @param {object} filters - Filter options
 * @param {string} filters.search - Search query
 * @param {string} filters.status - Status filter (active/inactive)
 * @param {string} filters.category - Category filter
 * @param {array} filters.sort_by - Sort fields array
 * @param {array} filters.sort_order - Sort orders array
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<object>} Items and pagination info
 */
async function getItems(filters = {}) {
  const {
    search,
    status,
    category,
    sort_by = ['createdAt'],
    sort_order = ['desc'],
    page = 1,
    limit = 20
  } = filters;

  // Build query
  const query = {};

  // Status filter
  if (status === 'active') {
    query.is_active = true;
  } else if (status === 'inactive') {
    query.is_active = false;
  }
  // If status is 'all' or not provided, no filter applied

  // Category filter
  if (category && category.trim()) {
    const normalizedCategory = categoryService.normalizeCategory(category);
    query.normalizedCategory = normalizedCategory;
  }

  // Search filter
  const normalizedSearch = normalizeSearchQuery(search);
  if (normalizedSearch) {
    // Escape regex special characters
    const escapedSearch = escapeRegex(normalizedSearch);
    const originalSearch = search.trim();
    const escapedOriginal = escapeRegex(originalSearch);
    
    query.$or = [
      { normalizedName: { $regex: escapedSearch, $options: 'i' } },
      { description: { $exists: true, $regex: escapedOriginal, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj = buildSortObject(sort_by, sort_order);

  // Pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [items, total] = await Promise.all([
    Item.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Item.countDocuments(query)
  ]);

  // Calculate pagination
  const totalPages = Math.max(0, Math.ceil(total / limitNum));
  const currentPage = Math.min(pageNum, totalPages || 1);

  return {
    items,
    pagination: {
      page: currentPage,
      limit: limitNum,
      total,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1
    }
  };
}

/**
 * Update an existing item
 * 
 * @param {string} itemId - Item ID
 * @param {object} updateData - Updated item data
 * @param {object} file - Multer file object (optional, for file replacement)
 * @param {string} userId - User ID updating the item
 * @returns {Promise<object>} - Updated item
 * @throws {Error} - If update fails (with statusCode)
 */
async function updateItem(itemId, updateData, file, userId) {
  // Check if item exists and is not deleted
  const existingItem = await Item.findOne({ _id: itemId, is_active: true });
  
  if (!existingItem) {
    const error = new Error(`Item with ID ${itemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Check if item is deleted (cannot edit deleted items)
  if (existingItem.deleted_at) {
    const error = new Error('Cannot edit deleted item');
    error.statusCode = 409;
    throw error;
  }

  // Validate update data - merge with existing item data for validation
  // But exclude MongoDB internal fields that shouldn't be validated
  const itemDataForValidation = {
    ...existingItem.toObject(),
    ...updateData
  };
  // Remove MongoDB internal fields
  delete itemDataForValidation._id;
  delete itemDataForValidation.__v;
  delete itemDataForValidation.createdAt;
  delete itemDataForValidation.updatedAt;
  
  // Try to validate, but catch duplicate errors and check if it's the same item
  try {
    await validateItemCreation(itemDataForValidation, file, userId);
  } catch (error) {
    // If it's a duplicate error (409), check if it's the same item
    if (error.statusCode === 409 && error.layer === 5) {
      // Check if the duplicate is the current item being updated
      const duplicateItem = await Item.findOne({
        normalizedName: itemDataForValidation.normalizedName,
        normalizedCategory: itemDataForValidation.normalizedCategory || categoryService.normalizeCategory(itemDataForValidation.category),
        created_by: userId,
        is_active: true
      });
      
      // If the duplicate is the current item, it's okay (updating same item)
      if (duplicateItem && duplicateItem._id.toString() === itemId) {
        // Allow the update to proceed
      } else {
        // It's a different item, throw the error
        throw error;
      }
    } else {
      // For other errors, re-throw
      throw error;
    }
  }

  // Handle file upload if provided
  let filePath = existingItem.file_path;
  if (file) {
    // Delete old file if exists
    if (existingItem.file_path) {
      await fileService.deleteFile(existingItem.file_path);
    }
    // Upload new file
    const tempFileInfo = await fileService.uploadToTemp(file, userId);
    filePath = await fileService.commitFileUpload(tempFileInfo.tempFilePath, userId, 'items');
  }

  // Normalize category if provided
  if (updateData.category) {
    updateData.category = categoryService.normalizeCategory(updateData.category);
    updateData.normalizedCategory = updateData.category;
  }

  // Normalize name if provided
  if (updateData.name) {
    const normalizedName = updateData.name.toLowerCase().trim();
    updateData.normalizedName = normalizedName;
    const nameLength = normalizedName.length;
    if (nameLength <= 2) {
      updateData.normalizedNamePrefix = normalizedName;
    } else if (nameLength <= 4) {
      updateData.normalizedNamePrefix = normalizedName.substring(0, nameLength - 1);
    } else {
      updateData.normalizedNamePrefix = normalizedName.substring(0, 5);
    }
  }

  // Update item
  if (filePath) {
    updateData.file_path = filePath;
  }

  const updatedItem = await Item.findByIdAndUpdate(
    itemId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedItem;
}

/**
 * Soft delete an item
 * 
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID deleting the item
 * @returns {Promise<object>} - Deleted item
 * @throws {Error} - If deletion fails (with statusCode)
 */
async function deleteItem(itemId, userId) {
  // Check if item exists
  const existingItem = await Item.findById(itemId);
  
  if (!existingItem) {
    const error = new Error(`Item with ID ${itemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Check if already deleted
  if (!existingItem.is_active || existingItem.deleted_at) {
    const error = new Error('Item is already deleted');
    error.statusCode = 409;
    throw error;
  }

  // Soft delete: set is_active to false and deleted_at to current time
  const deletedItem = await Item.findByIdAndUpdate(
    itemId,
    {
      $set: {
        is_active: false,
        deleted_at: new Date()
      }
    },
    { new: true }
  );

  return deletedItem;
}

module.exports = {
  createItem,
  getItemById,
  getItemsByUser,
  getItems,
  updateItem,
  deleteItem,
  deleteFile
};

