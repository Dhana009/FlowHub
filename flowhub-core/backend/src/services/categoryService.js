/**
 * Category Service
 * 
 * Handles category normalization and validation.
 * All categories are normalized to Title Case for consistent matching.
 */

/**
 * Normalize category to Title Case
 * 
 * @param {string} category - Category string to normalize
 * @returns {string} Normalized category in Title Case
 * 
 * @example
 * normalize('electronics') => 'Electronics'
 * normalize('HOME APPLIANCES') => 'Home Appliances'
 * normalize('consumer electronics') => 'Consumer Electronics'
 */
function normalizeCategory(category) {
  if (!category || typeof category !== 'string') {
    return category;
  }

  // Trim and convert to Title Case
  return category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Normalize category for database storage (lowercase)
 * Used for indexing and comparison
 * 
 * @param {string} category - Category string to normalize
 * @returns {string} Lowercase normalized category
 */
function normalizeCategoryForStorage(category) {
  const titleCase = normalizeCategory(category);
  return titleCase.toLowerCase();
}

/**
 * Validate category format
 * 
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid
 */
function isValidCategory(category) {
  if (!category || typeof category !== 'string') {
    return false;
  }
  const trimmed = category.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

module.exports = {
  normalizeCategory,
  normalizeCategoryForStorage,
  isValidCategory
};

