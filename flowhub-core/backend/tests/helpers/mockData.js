/**
 * Mock Data Generator
 * 
 * Generates test data for items, users, and files.
 */

const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const Item = require('../../src/models/Item');

/**
 * Generate mock user
 * 
 * @param {object} overrides - User data overrides
 * @returns {Promise<object>} Created user
 */
async function generateMockUser(overrides = {}) {
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash('Test123!@#', 10),
    isEmailVerified: true,
    ...overrides
  };

  return await User.create(defaultUser);
}

/**
 * Generate mock item data
 * 
 * @param {object} overrides - Item data overrides
 * @returns {object} Item data
 */
function generateMockItem(overrides = {}) {
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'];
  const itemType = overrides.item_type || 'PHYSICAL';

  const baseItem = {
    name: `Test Item ${Date.now()}`,
    description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
    item_type: itemType,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
    tags: ['test', 'item'],
    ...overrides
  };

  // Add required fields based on item_type
  // Only add defaults if the field is not explicitly set in overrides (even if undefined)
  if (itemType === 'PHYSICAL') {
    if (!('weight' in overrides)) {
      baseItem.weight = 1.0;
    }
    // Only add dimensions if none of them are explicitly set
    if (!('length' in overrides) && !('width' in overrides) && !('height' in overrides)) {
      baseItem.length = 10;
      baseItem.width = 10;
      baseItem.height = 10;
    }
  } else if (itemType === 'DIGITAL') {
    if (!('file_size' in overrides)) {
      baseItem.file_size = 1024;
    }
    if (!('download_url' in overrides)) {
      baseItem.download_url = 'https://example.com/download';
    }
  }

  return baseItem;
}

/**
 * Generate auth token for user
 * 
 * @param {object} user - User object
 * @returns {string} JWT token
 */
function generateAuthToken(user) {
  const jwt = require('jsonwebtoken');
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    type: 'access'
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
    { expiresIn: '15m' }
  );
}

/**
 * Create mock file buffer
 * 
 * @param {object} overrides - File overrides
 * @returns {object} Mock file object
 */
function createMockFile(overrides = {}) {
  return {
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('fake-image-data'),
    fieldname: 'images',
    ...overrides
  };
}

/**
 * Create large file buffer (>5MB)
 * 
 * @returns {object} Large mock file
 */
function createLargeFile() {
  return {
    originalname: 'large-file.jpg',
    mimetype: 'image/jpeg',
    size: 6 * 1024 * 1024, // 6MB
    buffer: Buffer.alloc(6 * 1024 * 1024),
    fieldname: 'images'
  };
}

/**
 * Create invalid file type
 * 
 * @returns {object} Invalid file
 */
function createInvalidFile() {
  return {
    originalname: 'test.exe',
    mimetype: 'application/x-msdownload',
    size: 1024,
    buffer: Buffer.from('executable content'),
    fieldname: 'images'
  };
}

/**
 * Create item with short name (<5 chars)
 * 
 * @param {object} overrides - Item overrides
 * @returns {object} Item with short name
 */
function createShortNameItem(overrides = {}) {
  const shortNames = ['TV', 'PC', 'Lap', 'Phon', 'iPad'];
  return generateMockItem({
    name: shortNames[Math.floor(Math.random() * shortNames.length)],
    ...overrides
  });
}

module.exports = {
  generateMockUser,
  generateMockItem,
  generateAuthToken,
  createMockFile,
  createLargeFile,
  createInvalidFile,
  createShortNameItem
};

