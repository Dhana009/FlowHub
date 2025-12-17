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
const activityService = require('./activityService');

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

    // Log activity (Flow 9)
    activityService.logActivity({
      userId,
      action: 'ITEM_CREATED',
      resourceType: 'ITEM',
      resourceId: result._id,
      details: { name: result.name, category: result.category }
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
 * @param {boolean} includeInactive - Whether to include inactive/deleted items (default: false)
 * @param {string} role - User role (optional, for ADMIN bypass)
 * @returns {Promise<object|null>} - Item or null if not found
 */
async function getItemById(itemId, userId = null, includeInactive = false, role = null) {
  const query = { _id: itemId };
  
  // Only filter by is_active if we don't want to include inactive items
  if (!includeInactive) {
    query.is_active = true;
  }
  
  if (userId && role !== 'ADMIN') {
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
    // Map 'category' to 'normalizedCategory' for sorting (database uses normalizedCategory for consistency)
    const sortField = field === 'category' ? 'normalizedCategory' : field;
    sortObj[sortField] = order;
  });
  
  // Add _id as tie-breaker to ensure deterministic sorting when primary/secondary fields have same values
  // This ensures MongoDB always applies the sort consistently
  if (!sortObj._id) {
    sortObj._id = 1; // Always sort by _id ascending as final tie-breaker
  }
  
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
 * @param {string} userId - User ID (required for data isolation)
 * @param {string} role - User role (optional, for ADMIN bypass)
 * @returns {Promise<object>} Items and pagination info
 */
async function getItems(filters = {}, userId = null, role = null) {
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

  // CRITICAL: Filter by user ownership for data isolation
  // Users can only see items they created, unless they are ADMIN
  if (userId && role !== 'ADMIN') {
    query.created_by = userId;
  }

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

  // Remove internal normalized fields from response (since we use .lean(), toJSON transform doesn't apply)
  const cleanedItems = items.map(item => {
    const { normalizedName, normalizedNamePrefix, normalizedCategory, __v, ...cleanedItem } = item;
    return cleanedItem;
  });

  // Calculate pagination
  const totalPages = Math.max(0, Math.ceil(total / limitNum));
  const currentPage = Math.min(pageNum, totalPages || 1);

  return {
    items: cleanedItems,
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
 * @param {number} providedVersion - Current version of the item
 * @param {string} role - User role (optional, for ADMIN bypass)
 * @returns {Promise<object>} - Updated item
 * @throws {Error} - If update fails (with statusCode)
 */
async function updateItem(itemId, updateData, file, userId, providedVersion, role = null) {
  // Step 1: Check ownership (users can only edit their own items, unless they are ADMIN)
  // Return 404 if item doesn't exist or not owned (security: don't reveal item exists)
  const ownershipQuery = { _id: itemId };
  if (role !== 'ADMIN') {
    ownershipQuery.created_by = userId;
  }
  const existingItem = await Item.findOne(ownershipQuery);
  
  if (!existingItem) {
    const error = new Error(`Item with ID ${itemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Check if item is deleted (cannot edit deleted items)
  // This must be checked before is_active since deleted items are also inactive
  if (existingItem.deleted_at) {
    const error = new Error('Cannot edit deleted item');
    error.statusCode = 409;
    error.errorCodeDetail = 'ITEM_DELETED';
    throw error;
  }

  // Step 3: Check if item is inactive (cannot edit inactive items)
  if (!existingItem.is_active) {
    const error = new Error('Cannot edit inactive item');
    error.statusCode = 409;
    error.errorCodeDetail = 'ITEM_INACTIVE';
    throw error;
  }

  // Step 4: Check version (required, must match current version)
  const currentVersion = parseInt(existingItem.version, 10);
  const versionToVerify = parseInt(providedVersion, 10);

  if (isNaN(versionToVerify) || versionToVerify < 1) {
    const error = new Error('Version field is required and must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  if (currentVersion !== versionToVerify) {
    const error = new Error(`Item was modified by another user. Expected version: ${currentVersion}, Provided: ${versionToVerify}`);
    error.statusCode = 409;
    error.errorCodeDetail = 'VERSION_CONFLICT';
    error.currentVersion = currentVersion;
    error.providedVersion = versionToVerify;
    throw error;
  }

  // Step 5: Handle item_type changes - clear old conditional fields
  const oldItemType = existingItem.item_type;
  const newItemType = updateData.item_type || oldItemType;
  
  // Track which fields to clear when item_type changes
  const fieldsToClear = [];
  if (newItemType !== oldItemType) {
    // Clear old conditional fields based on old type
    if (oldItemType === 'PHYSICAL') {
      updateData.weight = undefined;
      updateData.dimensions = undefined;
      fieldsToClear.push('weight', 'dimensions');
    } else if (oldItemType === 'DIGITAL') {
      updateData.download_url = undefined;
      updateData.file_size = undefined;
      fieldsToClear.push('download_url', 'file_size');
    } else if (oldItemType === 'SERVICE') {
      updateData.duration_hours = undefined;
      fieldsToClear.push('duration_hours');
    }
  }

  // Step 6: Validate update data - merge with existing item data for validation
  // Get raw document data (without Mongoose transforms)
  const existingItemRaw = existingItem.toObject({ getters: false, virtuals: false, transform: false });
  
  // Build validation data - start with existing item data
  // When item_type changes, we need to exclude old conditional fields entirely
  const itemDataForValidation = {};
  
  // Define fields to exclude based on new item_type
  const fieldsToExclude = new Set(); // Use Set for O(1) lookup
  if (newItemType !== oldItemType) {
    if (newItemType === 'DIGITAL') {
      fieldsToExclude.add('weight');
      fieldsToExclude.add('dimensions');
      fieldsToExclude.add('duration_hours');
      fieldsToExclude.add('length');
      fieldsToExclude.add('width');
      fieldsToExclude.add('height');
    } else if (newItemType === 'PHYSICAL') {
      fieldsToExclude.add('download_url');
      fieldsToExclude.add('file_size');
      fieldsToExclude.add('duration_hours');
    } else if (newItemType === 'SERVICE') {
      fieldsToExclude.add('weight');
      fieldsToExclude.add('dimensions');
      fieldsToExclude.add('download_url');
      fieldsToExclude.add('file_size');
      fieldsToExclude.add('length');
      fieldsToExclude.add('width');
      fieldsToExclude.add('height');
    }
  }
  
  // Copy all fields from existing item, excluding internal/system fields and old conditional fields
  for (const key in existingItemRaw) {
    // Skip internal/system fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'version', 'created_by', 'updated_by', 
         'file_path', 'normalizedName', 'normalizedNamePrefix', 'normalizedCategory', 
         'is_active', 'deleted_at'].includes(key)) {
      continue;
    }
    // Skip old conditional fields when item_type changes
    if (fieldsToExclude.has(key)) {
      continue;
    }
    itemDataForValidation[key] = existingItemRaw[key];
  }
  
  // Apply updates from updateData (these will override existing values)
  // But exclude fields that shouldn't be present for the new item_type
  for (const key in updateData) {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      // Don't include fields that are excluded for the new item_type
      if (!fieldsToExclude.has(key)) {
        itemDataForValidation[key] = updateData[key];
      }
    }
  }
  
  // Final safety check: explicitly remove any excluded fields that might have slipped through
  fieldsToExclude.forEach(field => {
    delete itemDataForValidation[field];
  });
  
  // Remove MongoDB internal fields
  delete itemDataForValidation._id;
  delete itemDataForValidation.__v;
  delete itemDataForValidation.createdAt;
  delete itemDataForValidation.updatedAt;
  delete itemDataForValidation.version; // Don't validate version in merged data
  // Remove system/internal fields that shouldn't be validated
  delete itemDataForValidation.created_by;
  delete itemDataForValidation.updated_by;
  delete itemDataForValidation.file_path;
  delete itemDataForValidation.normalizedName;
  delete itemDataForValidation.normalizedNamePrefix;
  delete itemDataForValidation.normalizedCategory;
  delete itemDataForValidation.is_active;
  delete itemDataForValidation.deleted_at;
  
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

  // Step 7: Handle file upload if provided
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

  // Step 8: Normalize category if provided
  if (updateData.category) {
    updateData.category = categoryService.normalizeCategory(updateData.category);
    updateData.normalizedCategory = updateData.category;
  }

  // Step 9: Normalize name if provided
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

  // Step 10: Prepare update data
  if (filePath) {
    updateData.file_path = filePath;
  }

  // Increment version and set updated_by
  updateData.version = existingItem.version + 1;
  updateData.updated_by = userId;

  // Filter out undefined values from updateData before database update
  // (undefined values cause Mongoose to cast to NaN for number fields)
  const cleanUpdateData = {};
  for (const key in updateData) {
    if (updateData[key] !== undefined) {
      cleanUpdateData[key] = updateData[key];
    }
  }

  // Prepare MongoDB update operation
  const updateOperation = { $set: cleanUpdateData };
  
  // If item_type changed, use $unset to remove old conditional fields
  if (newItemType !== oldItemType && fieldsToClear.length > 0) {
    updateOperation.$unset = {};
    fieldsToClear.forEach(field => {
      updateOperation.$unset[field] = '';
    });
  }

  // Step 11: Update item with optimistic locking (version must match)
  const updateQuery = { 
    _id: itemId, 
    version: versionToVerify,  // Use the verified number
    is_active: true,  // Double-check active status
    deleted_at: null  // Double-check not deleted
  };
  if (role !== 'ADMIN') {
    updateQuery.created_by = userId;
  }

  const updatedItem = await Item.findOneAndUpdate(
    updateQuery,
    updateOperation,
    { new: true, runValidators: true }
  );

  // If update returned null, version conflict occurred during update
  if (!updatedItem) {
    const error = new Error('Item version conflict occurred');
    error.statusCode = 409;
    error.errorCodeDetail = 'VERSION_CONFLICT';
    throw error;
  }

  // Log activity (Flow 9)
  activityService.logActivity({
    userId,
    action: 'ITEM_UPDATED',
    resourceType: 'ITEM',
    resourceId: updatedItem._id,
    details: { 
      name: updatedItem.name, 
      version: updatedItem.version,
      updated_fields: Object.keys(cleanUpdateData)
    }
  });

  return updatedItem;
}

/**
 * Soft delete an item
 * 
 * PRD Reference: Flow 6 - Item Delete (Section 6.3: Ownership Validation)
 * Users can only delete items they created.
 * 
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID deleting the item
 * @param {string} role - User role (optional, for ADMIN bypass)
 * @returns {Promise<object>} - Deleted item
 * @throws {Error} - If deletion fails (with statusCode)
 */
async function deleteItem(itemId, userId, role = null) {
  // PRD Section 6.3: Step 1 - Check ownership and existence
  // Return 404 if item doesn't exist or not owned (security: don't reveal ownership)
  const query = { _id: itemId };
  if (role !== 'ADMIN') {
    query.created_by = userId; // Ownership check
  }
  const existingItem = await Item.findOne(query);
  
  if (!existingItem) {
    // PRD Section 6.3: Return 404 (not 403) to prevent information disclosure
    const error = new Error(`Item with ID ${itemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // PRD Section 6.2: Step 2 - Check if already deleted
  // Item is already deleted if is_active is false OR deleted_at is set
  if (!existingItem.is_active || existingItem.deleted_at) {
    const error = new Error('Item is already deleted');
    error.statusCode = 409;
    error.errorCodeDetail = 'ITEM_ALREADY_DELETED';
    throw error;
  }

  // PRD Section 6.2: Step 3 - Soft delete
  // Set is_active to false and deleted_at to current time
  const deletedItem = await Item.findByIdAndUpdate(
    itemId,
    {
      $set: {
        is_active: false,
        deleted_at: new Date() // UTC timestamp
      }
      // updated_at automatically updated by Mongoose timestamps
    },
    { new: true }
  );

  // Log activity (Flow 9)
  activityService.logActivity({
    userId,
    action: 'ITEM_DEACTIVATED',
    resourceType: 'ITEM',
    resourceId: deletedItem._id,
    details: { name: deletedItem.name }
  });

  return deletedItem;
}

/**
 * Activate (restore) a deleted item
 * Sets is_active to true and clears deleted_at
 * 
 * @param {string} itemId - Item ID
 * @param {string} userId - User ID activating the item
 * @param {string} role - User role (optional, for ADMIN bypass)
 * @returns {Promise<object>} - Activated item
 * @throws {Error} - If activation fails (with statusCode)
 */
async function activateItem(itemId, userId, role = null) {
  // Step 1 - Check ownership and existence
  // Return 404 if item doesn't exist or not owned (security: don't reveal ownership)
  const query = { _id: itemId };
  if (role !== 'ADMIN') {
    query.created_by = userId; // Ownership check
  }
  const existingItem = await Item.findOne(query);
  
  if (!existingItem) {
    // Return 404 (not 403) to prevent information disclosure
    const error = new Error(`Item with ID ${itemId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Step 2 - Check if already active
  if (existingItem.is_active && !existingItem.deleted_at) {
    const error = new Error('Item is already active');
    error.statusCode = 409;
    error.errorCodeDetail = 'ITEM_ALREADY_ACTIVE';
    throw error;
  }

  // Step 3 - Activate item
  // Set is_active to true and clear deleted_at
  const activatedItem = await Item.findByIdAndUpdate(
    itemId,
    {
      $set: {
        is_active: true,
        deleted_at: null
      }
      // updated_at automatically updated by Mongoose timestamps
    },
    { new: true }
  );

  // Log activity (Flow 9)
  activityService.logActivity({
    userId,
    action: 'ITEM_ACTIVATED',
    resourceType: 'ITEM',
    resourceId: activatedItem._id,
    details: { name: activatedItem.name }
  });

  return activatedItem;
}

module.exports = {
  createItem,
  getItemById,
  getItemsByUser,
  getItems,
  updateItem,
  deleteItem,
  deleteFile,
  activateItem
};

