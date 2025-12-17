/**
 * Item Service
 * 
 * Contains all business logic for item operations.
 * No HTTP concerns - pure business logic.
 */

const Item = require('../models/Item');
const fs = require('fs').promises;
const path = require('path');

/**
 * Validate business rules for item creation
 * @param {object} itemData - Item data to validate
 * @returns {Promise<{valid: boolean, error: string|null}>}
 */
async function validateBusinessRules(itemData) {
  const { category, item_type, price, name } = itemData;

  // Business Rule 1: Category-Item Type Compatibility
  const categoryTypeRules = {
    'Electronics': 'PHYSICAL',
    'Software': 'DIGITAL',
    'Services': 'SERVICE'
  };

  if (categoryTypeRules[category] && categoryTypeRules[category] !== item_type) {
    const expectedType = categoryTypeRules[category];
    return {
      valid: false,
      error: `${category} must be ${expectedType.toLowerCase()} items`
    };
  }

  // Business Rule 2: Price Limits by Category
  const priceLimits = {
    'Electronics': { min: 10.00, max: 50000.00 },
    'Books': { min: 5.00, max: 500.00 },
    'Services': { min: 25.00, max: 10000.00 }
  };

  if (priceLimits[category]) {
    const limits = priceLimits[category];
    if (price < limits.min || price > limits.max) {
      return {
        valid: false,
        error: `Price for ${category} must be between $${limits.min.toFixed(2)} and $${limits.max.toFixed(2)}`
      };
    }
  }

  // Business Rule 3: Similar Items Check
  if (name && name.length >= 5) {
    const namePrefix = name.substring(0, 5);
    const similarItemsCount = await Item.countDocuments({
      name: { $regex: `^${namePrefix}`, $options: 'i' },
      category: category,
      is_active: true
    });

    if (similarItemsCount >= 3) {
      return {
        valid: false,
        error: 'Too many similar items exist in this category'
      };
    }
  }

  return { valid: true, error: null };
}

/**
 * Check for duplicate item (name + category)
 * @param {string} name - Item name
 * @param {string} category - Item category
 * @returns {Promise<boolean>} - True if duplicate exists
 */
async function checkDuplicate(name, category) {
  const existingItem = await Item.findOne({
    name: name,
    category: category,
    is_active: true
  });
  return !!existingItem;
}

/**
 * Create a new item
 * @param {object} itemData - Item data
 * @param {string} userId - User ID creating the item
 * @param {object} fileMetadata - Optional file metadata
 * @returns {Promise<object>} - Created item
 * @throws {Error} - If creation fails
 */
async function createItem(itemData, userId, fileMetadata = null) {
  // Check for duplicate
  const isDuplicate = await checkDuplicate(itemData.name, itemData.category);
  if (isDuplicate) {
    const error = new Error('Item with same name and category already exists');
    error.statusCode = 409;
    throw error;
  }

  // Validate business rules
  const businessRuleCheck = await validateBusinessRules(itemData);
  if (!businessRuleCheck.valid) {
    const error = new Error(businessRuleCheck.error);
    error.statusCode = 400;
    throw error;
  }

  // Prepare item data
  const itemToCreate = {
    ...itemData,
    created_by: userId,
    is_active: true
  };

  // Add file metadata if provided
  if (fileMetadata) {
    itemToCreate.file_path = fileMetadata.path;
    itemToCreate.file_metadata = {
      original_name: fileMetadata.original_name,
      content_type: fileMetadata.content_type,
      size: fileMetadata.size,
      uploaded_at: new Date()
    };
  }

  // Create item (Mongoose will validate schema)
  const item = await Item.create(itemToCreate);
  return item;
}

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  try {
    if (filePath) {
      const fullPath = path.join(__dirname, '../../', filePath);
      await fs.unlink(fullPath);
    }
  } catch (error) {
    // Log but don't throw - file might not exist
    console.error('Error deleting file:', error.message);
  }
}

/**
 * Clean up file on error
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<void>}
 */
async function cleanupFileOnError(filePath) {
  await deleteFile(filePath);
}

module.exports = {
  createItem,
  validateBusinessRules,
  checkDuplicate,
  deleteFile,
  cleanupFileOnError
};

