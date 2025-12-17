/**
 * Validation Service
 * 
 * Implements 5-layer sequential validation for item creation.
 * Stops at first failure and returns appropriate error codes.
 * 
 * Layer 1: Authentication (handled by middleware)
 * Layer 2: Schema Validation (422)
 * Layer 3: File Validation (413/415)
 * Layer 4: Business Rules (400)
 * Layer 5: Duplicate Detection (409)
 */

const Item = require('../models/Item');

/**
 * Validate item creation through all layers sequentially
 * Stops at first failure
 * 
 * @param {object} itemData - Item data to validate
 * @param {object} file - File object (optional)
 * @param {string} userId - User ID creating the item
 * @returns {Promise<object>} Validation results
 * @throws {Error} Validation error with layer and statusCode
 */
async function validateItemCreation(itemData, file, userId) {
  const context = {
    itemData,
    file,
    userId,
    layerResults: {}
  };

  // Layer 2: Schema Validation
  const schemaResult = validateSchema(itemData);
  if (!schemaResult.valid) {
    const error = new Error(schemaResult.message || 'Schema validation failed');
    error.statusCode = 422;
    error.layer = 2;
    error.details = schemaResult.errors;
    throw error;
  }
  context.layerResults.schema = schemaResult;

  // Layer 3: File Validation (only if file provided)
  if (file) {
    const fileResult = validateFile(file);
    if (!fileResult.valid) {
      const error = new Error(fileResult.message || 'File validation failed');
      error.statusCode = fileResult.statusCode || 415;
      error.layer = 3;
      error.details = fileResult.errors;
      throw error;
    }
    context.layerResults.file = fileResult;
  }

  // Layer 4: Business Rules Validation
  const businessResult = await validateBusinessRules(itemData, userId);
  if (!businessResult.valid) {
    const error = new Error(businessResult.message || 'Business rule validation failed');
    error.statusCode = 400;
    error.layer = 4;
    error.details = businessResult.errors;
    throw error;
  }
  context.layerResults.businessRules = businessResult;

  // Layer 5: Duplicate Detection
  const duplicateResult = await validateDuplicates(itemData, userId);
  if (!duplicateResult.valid) {
    const error = new Error(duplicateResult.message || 'Duplicate item detected');
    error.statusCode = 409;
    error.layer = 5;
    error.details = duplicateResult.errors;
    throw error;
  }
  context.layerResults.duplicates = duplicateResult;

  return context.layerResults;
}

/**
 * Layer 2: Schema Validation
 * Validates all field-level requirements
 */
function validateSchema(itemData) {
  const errors = [];

  // Name validation
  if (!itemData.name || typeof itemData.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else {
    const trimmed = itemData.name.trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      errors.push({ field: 'name', message: 'Name must be between 3 and 100 characters' });
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      errors.push({ field: 'name', message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores' });
    }
  }

  // Description validation
  if (!itemData.description || typeof itemData.description !== 'string') {
    errors.push({ field: 'description', message: 'Description is required' });
  } else {
    const trimmed = itemData.description.trim();
    if (trimmed.length < 10 || trimmed.length > 500) {
      errors.push({ field: 'description', message: 'Description must be between 10 and 500 characters' });
    }
  }

  // Item type validation
  if (!itemData.item_type) {
    errors.push({ field: 'item_type', message: 'Item type is required' });
  } else {
    const upperType = itemData.item_type.toUpperCase();
    if (!['PHYSICAL', 'DIGITAL', 'SERVICE'].includes(upperType)) {
      errors.push({ field: 'item_type', message: 'Item type must be PHYSICAL, DIGITAL, or SERVICE' });
    }
  }

  // Price validation
  if (itemData.price === undefined || itemData.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = typeof itemData.price === 'number' ? itemData.price : parseFloat(itemData.price);
    if (isNaN(price) || price < 0.01 || price > 999999.99) {
      errors.push({ field: 'price', message: 'Price must be between 0.01 and 999999.99' });
    } else {
      // Check decimal places - convert to string first to preserve original precision
      // If it's already a number, convert to string to check decimal places
      const priceStr = typeof itemData.price === 'string' 
        ? itemData.price.trim() 
        : itemData.price.toString();
      
      // Check if it has decimal point
      if (priceStr.includes('.')) {
        const decimalPart = priceStr.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
          errors.push({ field: 'price', message: 'Price must have at most 2 decimal places' });
        }
      }
    }
  }

  // Category validation
  if (!itemData.category || typeof itemData.category !== 'string') {
    errors.push({ field: 'category', message: 'Category is required' });
  } else {
    const trimmed = itemData.category.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      errors.push({ field: 'category', message: 'Category must be between 1 and 50 characters' });
    }
  }

  // Tags validation
  if (itemData.tags !== undefined && itemData.tags !== null) {
    if (!Array.isArray(itemData.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    } else {
      if (itemData.tags.length > 10) {
        errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
      }
      // Check for duplicates (case-insensitive)
      const normalizedTags = itemData.tags.map(t => t.toLowerCase().trim());
      const uniqueTags = new Set(normalizedTags);
      if (normalizedTags.length !== uniqueTags.size) {
        errors.push({ field: 'tags', message: 'Tags must be unique (case-insensitive)' });
      }
      // Validate each tag
      itemData.tags.forEach((tag, index) => {
        if (typeof tag !== 'string' || tag.trim().length < 1 || tag.trim().length > 30) {
          errors.push({ field: `tags[${index}]`, message: 'Each tag must be between 1 and 30 characters' });
        }
      });
    }
  }

  // Conditional field validation based on item_type
  const itemType = itemData.item_type?.toUpperCase();
  
  if (itemType === 'PHYSICAL') {
    if (itemData.weight === undefined || itemData.weight === null || isNaN(itemData.weight)) {
      errors.push({ field: 'weight', message: 'Weight is required for physical items' });
    }
    if (!itemData.dimensions || 
        itemData.dimensions.length === undefined || itemData.dimensions.length === null || isNaN(itemData.dimensions.length) ||
        itemData.dimensions.width === undefined || itemData.dimensions.width === null || isNaN(itemData.dimensions.width) ||
        itemData.dimensions.height === undefined || itemData.dimensions.height === null || isNaN(itemData.dimensions.height)) {
      errors.push({ field: 'dimensions', message: 'Dimensions (length, width, height) are required for physical items' });
    }
    // Check that non-applicable fields are not provided
    if (itemData.download_url || itemData.file_size || itemData.duration_hours) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for physical items' });
    }
  } else if (itemType === 'DIGITAL') {
    if (!itemData.download_url || typeof itemData.download_url !== 'string') {
      errors.push({ field: 'download_url', message: 'Download URL is required for digital items' });
    } else if (!/^https?:\/\/.+/.test(itemData.download_url)) {
      errors.push({ field: 'download_url', message: 'Download URL must be valid HTTP/HTTPS URL' });
    }
    if (itemData.file_size === undefined || itemData.file_size === null || isNaN(itemData.file_size)) {
      errors.push({ field: 'file_size', message: 'File size is required for digital items' });
    }
    // Check that non-applicable fields are not provided
    if (itemData.weight || itemData.dimensions || itemData.duration_hours) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for digital items' });
    }
  } else if (itemType === 'SERVICE') {
    if (itemData.duration_hours === undefined || itemData.duration_hours === null || isNaN(itemData.duration_hours)) {
      errors.push({ field: 'duration_hours', message: 'Duration hours is required for service items' });
    } else if (!Number.isInteger(parseInt(itemData.duration_hours))) {
      errors.push({ field: 'duration_hours', message: 'Duration hours must be an integer' });
    }
    // Check that non-applicable fields are not provided
    if (itemData.weight || itemData.dimensions || itemData.download_url || itemData.file_size) {
      errors.push({ field: 'item_type', message: 'These fields are not allowed for service items' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0].message : null
  };
}

/**
 * Layer 3: File Validation
 * Validates file type and size (only if file provided)
 */
function validateFile(file) {
  if (!file) {
    return { valid: true, hasFile: false };
  }

  const errors = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // File size validation
  if (file.size > maxSize) {
    errors.push({ field: 'file', message: 'File size exceeds 5 MB limit' });
  }

  // MIME type validation
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push({ field: 'file', message: 'File type not allowed. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx' });
  }

  if (errors.length > 0) {
    const statusCode = errors.some(e => e.message.includes('size')) ? 413 : 415;
    return {
      valid: false,
      errors,
      statusCode,
      message: errors[0].message
    };
  }

  return {
    valid: true,
    hasFile: true,
    fileInfo: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }
  };
}

/**
 * Layer 4: Business Rules Validation
 * Validates category-type compatibility, price ranges, and conditional field values
 */
async function validateBusinessRules(itemData, userId) {
  const errors = [];
  const { category, item_type, price } = itemData;

  // Normalize category to Title Case for comparison
  const normalizedCategory = category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  const upperType = item_type?.toUpperCase();

  // Category-item type compatibility
  if (normalizedCategory === 'Electronics' && upperType !== 'PHYSICAL') {
    errors.push({ field: 'category', message: 'Electronics category must be Physical item type' });
  }
  if (normalizedCategory === 'Software' && upperType !== 'DIGITAL') {
    errors.push({ field: 'category', message: 'Software category must be Digital item type' });
  }
  if (normalizedCategory === 'Services' && upperType !== 'SERVICE') {
    errors.push({ field: 'category', message: 'Services category must be Service item type' });
  }

  // Price range validation by category
  const priceNum = parseFloat(price);
  if (normalizedCategory === 'Electronics') {
    if (priceNum < 10 || priceNum > 50000) {
      errors.push({ field: 'price', message: 'Electronics price must be between $10.00 and $50,000.00' });
    }
  } else if (normalizedCategory === 'Books') {
    if (priceNum < 5 || priceNum > 500) {
      errors.push({ field: 'price', message: 'Books price must be between $5.00 and $500.00' });
    }
  } else if (normalizedCategory === 'Services') {
    if (priceNum < 25 || priceNum > 10000) {
      errors.push({ field: 'price', message: 'Services price must be between $25.00 and $10,000.00' });
    }
  }

  // Conditional field value validation (business rules for values)
  if (upperType === 'PHYSICAL') {
    if (itemData.weight !== undefined && itemData.weight !== null && itemData.weight <= 0) {
      errors.push({ field: 'weight', message: 'Weight must be greater than 0' });
    }
    if (itemData.dimensions) {
      if (itemData.dimensions.length !== undefined && itemData.dimensions.length !== null && itemData.dimensions.length <= 0) {
        errors.push({ field: 'dimensions.length', message: 'Length must be greater than 0' });
      }
      if (itemData.dimensions.width !== undefined && itemData.dimensions.width !== null && itemData.dimensions.width <= 0) {
        errors.push({ field: 'dimensions.width', message: 'Width must be greater than 0' });
      }
      if (itemData.dimensions.height !== undefined && itemData.dimensions.height !== null && itemData.dimensions.height <= 0) {
        errors.push({ field: 'dimensions.height', message: 'Height must be greater than 0' });
      }
    }
  } else if (upperType === 'DIGITAL') {
    if (itemData.file_size !== undefined && itemData.file_size !== null && itemData.file_size <= 0) {
      errors.push({ field: 'file_size', message: 'File size must be greater than 0' });
    }
  } else if (upperType === 'SERVICE') {
    if (itemData.duration_hours !== undefined && itemData.duration_hours !== null && (!Number.isInteger(parseInt(itemData.duration_hours)) || itemData.duration_hours <= 0)) {
      errors.push({ field: 'duration_hours', message: 'Duration hours must be a positive integer' });
    }
  }

  // Similar items check (using adaptive prefix)
  const normalizedName = itemData.name.toLowerCase().trim().replace(/\s+/g, ' ');
  const nameLength = normalizedName.length;
  
  let prefix;
  if (nameLength === 0) {
    prefix = '';
  } else if (nameLength <= 2) {
    prefix = normalizedName;
  } else if (nameLength <= 4) {
    prefix = normalizedName.substring(0, nameLength - 1);
  } else {
    prefix = normalizedName.substring(0, 5);
  }

  if (prefix) {
    const similarCount = await Item.countDocuments({
      normalizedNamePrefix: prefix,
      normalizedCategory: normalizedCategory.toLowerCase(),
      created_by: userId,
      is_active: true
    });

    if (similarCount >= 3) {
      errors.push({ field: 'name', message: 'Too many similar items exist in this category' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors[0].message : null
  };
}

/**
 * Layer 5: Duplicate Detection
 * Checks for exact duplicates using normalized fields
 */
async function validateDuplicates(itemData, userId) {
  const normalizedName = itemData.name.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedCategory = itemData.category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  ).toLowerCase();

  // Check for exact duplicate
  const existingItem = await Item.findOne({
    normalizedName: normalizedName,
    normalizedCategory: normalizedCategory,
    created_by: userId,
    is_active: true
  });

  if (existingItem) {
    return {
      valid: false,
      errors: [{ field: 'name', message: 'Item with same name and category already exists' }],
      message: 'Item with same name and category already exists',
      duplicate: {
        id: existingItem._id,
        name: existingItem.name,
        category: existingItem.category
      }
    };
  }

  return {
    valid: true,
    errors: []
  };
}

module.exports = {
  validateItemCreation,
  validateSchema,
  validateFile,
  validateBusinessRules,
  validateDuplicates
};

