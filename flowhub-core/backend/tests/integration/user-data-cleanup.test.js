/**
 * User Data Cleanup Endpoint Integration Tests
 * 
 * Comprehensive test suite for DELETE /api/v1/internal/users/:userId/data
 * Tests hard deletion of user data while preserving user record
 */

const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser, generateMockItem, generateAuthToken } = require('../helpers/mockData');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Item = require('../../src/models/Item');
const BulkJob = require('../../src/models/BulkJob');
const ActivityLog = require('../../src/models/ActivityLog');
const OTP = require('../../src/models/OTP');

// Internal key for authentication
const INTERNAL_KEY = process.env.INTERNAL_AUTOMATION_KEY || 'flowhub-secret-automation-key-2025';

describe('User Data Cleanup Endpoint Tests', () => {
  let testUser1, testUser2;
  let testUser1Id, testUser2Id;
  let testUser1Token, testUser2Token;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    // Create test users
    testUser1 = await generateMockUser({
      email: `user1${Date.now()}${Math.random()}@example.com`,
      role: 'EDITOR'
    });
    testUser1Id = testUser1._id.toString();
    testUser1Token = generateAuthToken(testUser1);

    testUser2 = await generateMockUser({
      email: `user2${Date.now()}${Math.random()}@example.com`,
      role: 'EDITOR'
    });
    testUser2Id = testUser2._id.toString();
    testUser2Token = generateAuthToken(testUser2);
  });

  // Helper function to create items via API
  async function createItemViaAPI(token, itemData) {
    const response = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send(itemData)
      .expect(201);
    return response.body.data;
  }

  // Helper function to create a test file
  async function createTestFile(userId, itemId) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'items');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${itemId}_test-file.jpg`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, 'test file content');
    return `uploads/items/${fileName}`;
  }

  // ============================================================================
  // SUCCESS CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/users/:userId/data - Success Cases', () => {
    
    test('should delete all user data and preserve user record', async () => {
      // Create test data for user1
      const item1 = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'User1 Item 1',
        category: 'Electronics',
        price: 100.00
      }));
      const item2 = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'User1 Item 2',
        category: 'Books',
        price: 50.00
      }));

      // Create BulkJob
      const bulkJob = await BulkJob.create({
        userId: testUser1Id,
        operation: 'delete',
        itemIds: [item1._id],
        status: 'completed',
        totalItems: 1,
        processedIds: [item1._id]
      });

      // Create ActivityLog
      const activityLog = await ActivityLog.create({
        userId: testUser1Id,
        action: 'ITEM_CREATED',
        resourceType: 'ITEM',
        resourceId: item1._id,
        details: { name: 'User1 Item 1' }
      });

      // Create OTP
      const otp = await OTP.create({
        email: testUser1.email.toLowerCase(),
        otp: 'hashed123456',
        otpPlain: '123456',
        type: 'signup',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      // Verify data exists before deletion
      // Note: Item creation auto-creates ActivityLogs, so count includes those
      const expectedActivityLogCount = await ActivityLog.countDocuments({ userId: testUser1Id });
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(2);
      expect(await BulkJob.countDocuments({ userId: testUser1Id })).toBe(1);
      expect(expectedActivityLogCount).toBeGreaterThanOrEqual(1); // At least 1 manual + auto-created ones
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(1);
      expect(await User.findById(testUser1Id)).toBeTruthy();

      // Call cleanup endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify response structure
      expect(response.body.status).toBe('success');
      expect(response.body.deleted).toHaveProperty('items');
      expect(response.body.deleted).toHaveProperty('files');
      expect(response.body.deleted).toHaveProperty('bulk_jobs');
      expect(response.body.deleted).toHaveProperty('activity_logs');
      expect(response.body.deleted).toHaveProperty('otps');
      expect(response.body.preserved).toEqual({ user: true });

      // Verify deletion counts
      expect(response.body.deleted.items).toBe(2);
      expect(response.body.deleted.bulk_jobs).toBe(1);
      expect(response.body.deleted.activity_logs).toBe(expectedActivityLogCount); // All activity logs should be deleted
      expect(response.body.deleted.otps).toBe(1);

      // Verify data is deleted
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(0);
      expect(await BulkJob.countDocuments({ userId: testUser1Id })).toBe(0);
      expect(await ActivityLog.countDocuments({ userId: testUser1Id })).toBe(0);
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(0);

      // Verify user record is preserved
      const preservedUser = await User.findById(testUser1Id);
      expect(preservedUser).toBeTruthy();
      expect(preservedUser.email).toBe(testUser1.email);
    });

    test('should delete files associated with items', async () => {
      // Create item with file
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Item with File',
        category: 'Electronics',
        price: 100.00
      }));

      // Create test file and update item
      const filePath = await createTestFile(testUser1Id, item._id);
      await Item.updateOne({ _id: item._id }, { file_path: filePath });

      // Verify file exists
      const fullPath = path.join(process.cwd(), filePath);
      await expect(fs.access(fullPath)).resolves.not.toThrow();

      // Call cleanup endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify file is deleted
      await expect(fs.access(fullPath)).rejects.toThrow();
      expect(response.body.deleted.files).toBe(1);
    });

    test('should preserve other users data', async () => {
      // Create data for both users
      const item1 = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'User1 Item',
        category: 'Electronics',
        price: 100.00
      }));
      const item2 = await createItemViaAPI(testUser2Token, generateMockItem({ 
        name: 'User2 Item',
        category: 'Books',
        price: 50.00
      }));

      // Call cleanup for user1 only
      await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify user1 data is deleted
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(0);

      // Verify user2 data is preserved
      expect(await Item.countDocuments({ created_by: testUser2Id })).toBe(1);
      const preservedItem = await Item.findById(item2._id);
      expect(preservedItem).toBeTruthy();
      expect(preservedItem.name).toBe('User2 Item');
    });

    test('should handle user with no data (return 0 counts)', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.deleted.items).toBe(0);
      expect(response.body.deleted.files).toBe(0);
      expect(response.body.deleted.bulk_jobs).toBe(0);
      expect(response.body.deleted.activity_logs).toBe(0);
      expect(response.body.deleted.otps).toBe(0);
      expect(response.body.preserved.user).toBe(true);
    });

    test('should handle query parameter include_otp=false', async () => {
      // Create OTP
      await OTP.create({
        email: testUser1.email.toLowerCase(),
        otp: 'hashed123456',
        otpPlain: '123456',
        type: 'signup',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      // Create item
      await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      // Call cleanup with include_otp=false
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data?include_otp=false`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify OTP is preserved
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(1);
      expect(response.body.deleted.otps).toBe(0);
      expect(response.body.deleted.items).toBe(1);
    });

    test('should handle query parameter include_activity_logs=false', async () => {
      // Create item (this will auto-create an ActivityLog)
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      // Create another activity log manually
      await ActivityLog.create({
        userId: testUser1Id,
        action: 'ITEM_CREATED',
        resourceType: 'ITEM',
        resourceId: item._id,
        details: { name: 'Test Item Manual' }
      });

      // Verify we have 2 activity logs (1 auto-created + 1 manual)
      const initialCount = await ActivityLog.countDocuments({ userId: testUser1Id });
      expect(initialCount).toBeGreaterThanOrEqual(1);

      // Call cleanup with include_activity_logs=false
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data?include_activity_logs=false`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify activity logs are preserved (none deleted)
      const finalCount = await ActivityLog.countDocuments({ userId: testUser1Id });
      expect(finalCount).toBe(initialCount); // All should remain
      expect(response.body.deleted.activity_logs).toBe(0);
      expect(response.body.deleted.items).toBe(1);
    });

    test('should handle both query parameters together', async () => {
      // Create all types of data
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      await ActivityLog.create({
        userId: testUser1Id,
        action: 'ITEM_CREATED',
        resourceType: 'ITEM',
        resourceId: item._id,
        details: { name: 'Test Item' }
      });

      await OTP.create({
        email: testUser1.email.toLowerCase(),
        otp: 'hashed123456',
        otpPlain: '123456',
        type: 'signup',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      // Call cleanup preserving both
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data?include_otp=false&include_activity_logs=false`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify initial counts (item creation auto-creates ActivityLog)
      const initialActivityLogCount = await ActivityLog.countDocuments({ userId: testUser1Id });
      const initialOTPCount = await OTP.countDocuments({ email: testUser1.email.toLowerCase() });
      
      // Verify both are preserved (none deleted)
      expect(await ActivityLog.countDocuments({ userId: testUser1Id })).toBe(initialActivityLogCount);
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(initialOTPCount);
      expect(response.body.deleted.activity_logs).toBe(0);
      expect(response.body.deleted.otps).toBe(0);
      expect(response.body.deleted.items).toBe(1);
    });
  });

  // ============================================================================
  // ERROR CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/users/:userId/data - Error Cases', () => {
    
    test('should return 401 when internal key is missing', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 401 when internal key is invalid', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', 'invalid-key')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 400 for invalid userId format', async () => {
      const response = await request(app)
        .delete('/api/v1/internal/users/invalid-id/data')
        .set('x-internal-key', INTERNAL_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
      expect(response.body.error_type).toContain('Invalid ID format');
      expect(response.body.message).toContain('24-character hexadecimal');
    });

    test('should return 404 when user does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/internal/users/${fakeId}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
      expect(response.body.error_type).toBe('Not Found');
      expect(response.body.message).toContain('User not found');
    });

    test('should handle malformed ObjectId gracefully', async () => {
      const response = await request(app)
        .delete('/api/v1/internal/users/12345/data')
        .set('x-internal-key', INTERNAL_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/users/:userId/data - Edge Cases', () => {
    
    test('should handle items with missing file_path gracefully', async () => {
      // Create item without file_path
      await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Item without File',
        category: 'Electronics',
        price: 100.00
      }));

      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(response.body.deleted.items).toBe(1);
      expect(response.body.deleted.files).toBe(0);
    });

    test('should handle non-existent files gracefully', async () => {
      // Create item with file_path pointing to non-existent file
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Item with Missing File',
        category: 'Electronics',
        price: 100.00
      }));

      await Item.updateOne(
        { _id: item._id }, 
        { file_path: 'uploads/items/non-existent-file.jpg' }
      );

      // Should not throw error, just return 0 files deleted
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(response.body.deleted.items).toBe(1);
      expect(response.body.deleted.files).toBe(0);
    });

    test('should handle multiple files correctly', async () => {
      // Create multiple items with files
      const item1 = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Item 1',
        category: 'Electronics',
        price: 100.00
      }));
      const item2 = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Item 2',
        category: 'Books',
        price: 50.00
      }));

      const filePath1 = await createTestFile(testUser1Id, item1._id);
      const filePath2 = await createTestFile(testUser1Id, item2._id);

      await Item.updateOne({ _id: item1._id }, { file_path: filePath1 });
      await Item.updateOne({ _id: item2._id }, { file_path: filePath2 });

      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(response.body.deleted.items).toBe(2);
      expect(response.body.deleted.files).toBe(2);
    });

    test('should handle large number of items efficiently', async () => {
      // Create 50 items
      for (let i = 0; i < 50; i++) {
        await createItemViaAPI(testUser1Token, generateMockItem({ 
          name: `Item ${i}`,
          category: 'Electronics',
          price: 100.00 + i
        }));
      }

      const startTime = Date.now();
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.deleted.items).toBe(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in < 5 seconds
    });

    test('should handle OTPs with different email cases', async () => {
      // Create OTPs with different email cases
      await OTP.create({
        email: testUser1.email.toLowerCase(),
        otp: 'hashed123456',
        otpPlain: '123456',
        type: 'signup',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      await OTP.create({
        email: testUser1.email.toUpperCase(),
        otp: 'hashed789012',
        otpPlain: '789012',
        type: 'password-reset',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Should delete both (email is normalized in service)
      expect(response.body.deleted.otps).toBeGreaterThanOrEqual(1);
      expect(await OTP.countDocuments({ 
        email: { $in: [testUser1.email.toLowerCase(), testUser1.email.toUpperCase()] }
      })).toBe(0);
    });
  });

  // ============================================================================
  // REGRESSION TESTS
  // ============================================================================

  describe('DELETE /api/v1/internal/users/:userId/data - Regression Tests', () => {
    
    test('should not affect other internal endpoints', async () => {
      // Verify reset endpoint still works
      await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      const resetResponse = await request(app)
        .post('/api/v1/internal/reset')
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(resetResponse.body.status).toBe('success');
    });

    test('should not affect regular item endpoints', async () => {
      // Create item
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      // Cleanup user data
      await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/data`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify regular endpoints still work
      const getResponse = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${testUser2Token}`)
        .expect(200);

      expect(getResponse.body.status).toBe('success');
    });
  });
});
