/**
 * User Items Cleanup Endpoint Integration Tests
 * 
 * Tests for DELETE /api/v1/internal/users/:userId/items
 * Verifies that only items are deleted, other data types are preserved
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

describe('User Items Cleanup Endpoint Tests', () => {
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

  describe('DELETE /api/v1/internal/users/:userId/items - Success Cases', () => {
    
    test('should delete only items and preserve other data types', async () => {
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
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(2);
      expect(await BulkJob.countDocuments({ userId: testUser1Id })).toBe(1);
      expect(await ActivityLog.countDocuments({ userId: testUser1Id })).toBeGreaterThanOrEqual(1);
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(1);
      expect(await User.findById(testUser1Id)).toBeTruthy();

      // Call cleanup endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify response structure
      expect(response.body.status).toBe('success');
      expect(response.body.deleted).toHaveProperty('items');
      expect(response.body.deleted).toHaveProperty('files');
      expect(response.body.preserved).toEqual({
        user: true,
        bulk_jobs: true,
        activity_logs: true,
        otps: true
      });

      // Verify deletion counts
      expect(response.body.deleted.items).toBe(2);
      expect(response.body.deleted.files).toBe(0); // No files in this test

      // Verify items are deleted
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(0);

      // Verify other data types are preserved
      expect(await BulkJob.countDocuments({ userId: testUser1Id })).toBe(1);
      expect(await ActivityLog.countDocuments({ userId: testUser1Id })).toBeGreaterThanOrEqual(1);
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(1);

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
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify file is deleted
      await expect(fs.access(fullPath)).rejects.toThrow();
      expect(response.body.deleted.files).toBe(1);
      expect(response.body.deleted.items).toBe(1);
    });

    test('should preserve other users items', async () => {
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
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify user1 items are deleted
      expect(await Item.countDocuments({ created_by: testUser1Id })).toBe(0);

      // Verify user2 items are preserved
      expect(await Item.countDocuments({ created_by: testUser2Id })).toBe(1);
      const preservedItem = await Item.findById(item2._id);
      expect(preservedItem).toBeTruthy();
      expect(preservedItem.name).toBe('User2 Item');
    });

    test('should handle user with no items (return 0 counts)', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.deleted.items).toBe(0);
      expect(response.body.deleted.files).toBe(0);
      expect(response.body.preserved.user).toBe(true);
    });

    test('should preserve BulkJobs when deleting items', async () => {
      // Create item and bulk job
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      const bulkJob = await BulkJob.create({
        userId: testUser1Id,
        operation: 'delete',
        itemIds: [item._id],
        status: 'processing',
        totalItems: 1,
        processedIds: []
      });

      // Delete items
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify items deleted
      expect(response.body.deleted.items).toBe(1);

      // Verify bulk job preserved
      expect(await BulkJob.countDocuments({ userId: testUser1Id })).toBe(1);
      const preservedJob = await BulkJob.findById(bulkJob._id);
      expect(preservedJob).toBeTruthy();
      expect(preservedJob.status).toBe('processing');
    });

    test('should preserve ActivityLogs when deleting items', async () => {
      // Create item and activity log
      const item = await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      const activityLog = await ActivityLog.create({
        userId: testUser1Id,
        action: 'ITEM_CREATED',
        resourceType: 'ITEM',
        resourceId: item._id,
        details: { name: 'Test Item' }
      });

      // Delete items
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify items deleted
      expect(response.body.deleted.items).toBe(1);

      // Verify activity log preserved
      const initialCount = await ActivityLog.countDocuments({ userId: testUser1Id });
      expect(initialCount).toBeGreaterThanOrEqual(1);
      const preservedLog = await ActivityLog.findById(activityLog._id);
      expect(preservedLog).toBeTruthy();
    });

    test('should preserve OTPs when deleting items', async () => {
      // Create item and OTP
      await createItemViaAPI(testUser1Token, generateMockItem({ 
        name: 'Test Item',
        category: 'Electronics',
        price: 100.00
      }));

      const otp = await OTP.create({
        email: testUser1.email.toLowerCase(),
        otp: 'hashed123456',
        otpPlain: '123456',
        type: 'signup',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60000)
      });

      // Delete items
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify items deleted
      expect(response.body.deleted.items).toBe(1);

      // Verify OTP preserved
      expect(await OTP.countDocuments({ email: testUser1.email.toLowerCase() })).toBe(1);
      const preservedOTP = await OTP.findById(otp._id);
      expect(preservedOTP).toBeTruthy();
    });
  });

  // ============================================================================
  // ERROR CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/users/:userId/items - Error Cases', () => {
    
    test('should return 401 when internal key is missing', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 401 when internal key is invalid', async () => {
      const response = await request(app)
        .delete(`/api/v1/internal/users/${testUser1Id}/items`)
        .set('x-internal-key', 'invalid-key')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 400 for invalid userId format', async () => {
      const response = await request(app)
        .delete('/api/v1/internal/users/invalid-id/items')
        .set('x-internal-key', INTERNAL_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
      expect(response.body.error_type).toContain('Invalid ID format');
    });

    test('should return 404 when user does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/internal/users/${fakeId}/items`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
      expect(response.body.error_type).toBe('Not Found');
      expect(response.body.message).toContain('User not found');
    });
  });
});
