/**
 * Test Utilities
 * 
 * Common utilities for testing.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate test JWT token
 * 
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
function generateTestToken(userId = '507f1f77bcf86cd799439012', email = 'test@example.com') {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

/**
 * Create test user data
 * 
 * @returns {object} User data
 */
function createTestUser(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439012',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    passwordHash: '$2a$10$testHash',
    ...overrides
  };
}

/**
 * Create test item data
 * 
 * @param {string} itemType - Item type (PHYSICAL, DIGITAL, SERVICE)
 * @returns {object} Item data
 */
function createTestItemData(itemType = 'PHYSICAL', overrides = {}) {
  const baseData = {
    name: 'Test Item',
    description: 'This is a test item description for testing purposes',
    item_type: itemType,
    price: 99.99,
    category: 'Electronics',
    tags: ['test', 'item']
  };

  if (itemType === 'PHYSICAL') {
    baseData.weight = 2.5;
    baseData.dimensions = {
      length: 10,
      width: 5,
      height: 2
    };
  } else if (itemType === 'DIGITAL') {
    baseData.download_url = 'https://example.com/download/file.zip';
    baseData.file_size = 1024000;
  } else if (itemType === 'SERVICE') {
    baseData.duration_hours = 2;
  }

  return { ...baseData, ...overrides };
}

/**
 * Create mock file object
 * 
 * @param {object} overrides - File overrides
 * @returns {object} Mock file
 */
function createMockFile(overrides = {}) {
  return {
    originalname: 'test-file.pdf',
    mimetype: 'application/pdf',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('test file content'),
    ...overrides
  };
}

/**
 * Wait for specified time
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  generateTestToken,
  createTestUser,
  createTestItemData,
  createMockFile,
  wait
};

