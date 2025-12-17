/**
 * Validation Utility
 * 
 * Reusable validation functions for form fields.
 * All functions are pure (no side effects).
 * Returns empty string if valid, error message if invalid.
 */

/**
 * Validate email format
 * 
 * @param {string} value - Email to validate
 * @returns {string} - Error message or empty string if valid
 */
export function email(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please provide a valid email address';
  }

  return '';
}

/**
 * Validate password (required only)
 * 
 * @param {string} value - Password to validate
 * @returns {string} - Error message or empty string if valid
 */
export function password(value) {
  if (!value) {
    return 'Password is required';
  }

  return '';
}

/**
 * Validate password strength
 * 
 * Rules:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*)
 * 
 * @param {string} value - Password to validate
 * @returns {string} - Error message or empty string if valid
 */
export function passwordStrength(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*]/.test(value)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }

  return '';
}

/**
 * Validate first name
 * 
 * @param {string} value - First name to validate
 * @returns {string} - Error message or empty string if valid
 */
export function firstName(value) {
  if (!value) {
    return 'First name is required';
  }

  if (value.length < 2) {
    return 'First name must be at least 2 characters long';
  }

  if (value.length > 50) {
    return 'First name must not exceed 50 characters';
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(value)) {
    return 'First name can only contain letters and spaces';
  }

  return '';
}

/**
 * Validate last name
 * 
 * @param {string} value - Last name to validate
 * @returns {string} - Error message or empty string if valid
 */
export function lastName(value) {
  if (!value) {
    return 'Last name is required';
  }

  if (value.length < 2) {
    return 'Last name must be at least 2 characters long';
  }

  if (value.length > 50) {
    return 'Last name must not exceed 50 characters';
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(value)) {
    return 'Last name can only contain letters and spaces';
  }

  return '';
}

/**
 * Validate confirm password
 * 
 * @param {string} value - Confirm password value
 * @param {string} password - Original password to match
 * @returns {string} - Error message or empty string if valid
 */
export function confirmPassword(value, password) {
  if (!value) {
    return 'Please confirm your password';
  }

  if (value !== password) {
    return 'Passwords do not match';
  }

  return '';
}

/**
 * Validate OTP (6 digits)
 * 
 * @param {string} value - OTP to validate
 * @returns {string} - Error message or empty string if valid
 */
export function otp(value) {
  if (!value) {
    return 'OTP is required';
  }

  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(value)) {
    return 'OTP must be exactly 6 digits';
  }

  return '';
}

/**
 * Validate item name
 * 
 * @param {string} value - Item name to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 3) {
    return 'Name must be at least 3 characters';
  }

  if (value.length > 100) {
    return 'Name must not exceed 100 characters';
  }

  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!nameRegex.test(value)) {
    return 'Name can only contain letters, numbers, spaces, hyphens, and underscores';
  }

  return '';
}

/**
 * Validate item description
 * 
 * @param {string} value - Description to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemDescription(value) {
  if (!value) {
    return 'Description is required';
  }

  if (value.length < 10) {
    return 'Description must be at least 10 characters';
  }

  if (value.length > 500) {
    return 'Description must not exceed 500 characters';
  }

  return '';
}

/**
 * Validate item type
 * 
 * @param {string} value - Item type to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemType(value) {
  if (!value) {
    return 'Item type is required';
  }

  const validTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE'];
  if (!validTypes.includes(value.toUpperCase())) {
    return 'Item type must be Physical, Digital, or Service';
  }

  return '';
}

/**
 * Validate price
 * 
 * @param {string|number} value - Price to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemPrice(value) {
  if (!value && value !== 0) {
    return 'Price is required';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'Price must be a valid number';
  }

  if (numValue < 0.01) {
    return 'Price must be at least $0.01';
  }

  if (numValue > 999999.99) {
    return 'Price must not exceed $999,999.99';
  }

  return '';
}

/**
 * Validate category
 * 
 * @param {string} value - Category to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemCategory(value) {
  if (!value) {
    return 'Category is required';
  }

  if (value.length < 1) {
    return 'Category must be at least 1 character';
  }

  if (value.length > 50) {
    return 'Category must not exceed 50 characters';
  }

  return '';
}

/**
 * Validate tags
 * 
 * @param {string|array} value - Tags to validate (comma-separated string or array)
 * @returns {string} - Error message or empty string if valid
 */
export function itemTags(value) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return ''; // Tags are optional
  }

  // Convert to array if string
  const tags = typeof value === 'string' 
    ? value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : value;

  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }

  // Check for duplicates
  const uniqueTags = new Set(tags);
  if (uniqueTags.size !== tags.length) {
    return 'Tags must be unique';
  }

  // Check each tag length
  for (const tag of tags) {
    if (tag.length < 1) {
      return 'Each tag must be at least 1 character';
    }
    if (tag.length > 30) {
      return 'Each tag must not exceed 30 characters';
    }
  }

  return '';
}

/**
 * Validate weight (for physical items)
 * 
 * @param {string|number} value - Weight to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemWeight(value) {
  if (!value && value !== 0) {
    return 'Weight is required for physical items';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'Weight must be a valid number';
  }

  if (numValue <= 0) {
    return 'Weight must be greater than 0';
  }

  return '';
}

/**
 * Validate dimension (length, width, or height)
 * 
 * @param {string|number} value - Dimension to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemDimension(value) {
  if (!value && value !== 0) {
    return 'Dimension is required';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'Dimension must be a valid number';
  }

  if (numValue <= 0) {
    return 'Dimension must be greater than 0';
  }

  return '';
}

/**
 * Validate download URL (for digital items)
 * 
 * @param {string} value - URL to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemDownloadUrl(value) {
  if (!value) {
    return 'Download URL is required for digital items';
  }

  try {
    new URL(value);
    return '';
  } catch {
    return 'Download URL must be a valid URL';
  }
}

/**
 * Validate file size (for digital items)
 * 
 * @param {string|number} value - File size to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemFileSize(value) {
  if (!value && value !== 0) {
    return 'File size is required for digital items';
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(numValue)) {
    return 'File size must be a valid number';
  }

  if (numValue <= 0) {
    return 'File size must be greater than 0';
  }

  return '';
}

/**
 * Validate duration hours (for service items)
 * 
 * @param {string|number} value - Duration to validate
 * @returns {string} - Error message or empty string if valid
 */
export function itemDurationHours(value) {
  if (!value && value !== 0) {
    return 'Duration is required for service items';
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(numValue)) {
    return 'Duration must be a valid number';
  }

  if (numValue < 1) {
    return 'Duration must be at least 1 hour';
  }

  return '';
}

