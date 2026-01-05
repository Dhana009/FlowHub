/**
 * Single Item Hard Delete Endpoint Integration Tests
 * 
 * Tests for DELETE /api/v1/internal/items/:id/permanent
 * Verifies that a single item is permanently deleted from MongoDB
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

// Internal key for authentication
const INTERNAL_KEY = process.env.INTERNAL_AUTOMATION_KEY || 'flowhub-secret-automation-key-2025';

describe('Single Item Hard Delete Endpoint Tests', () => {
  let testUser;
  let testUserId;
  let testUserToken;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();

    // Create test user
    testUser = await generateMockUser({
      email: `user${Date.now()}${Math.random()}@example.com`,
      role: 'EDITOR'
    });
    testUserId = testUser._id.toString();
    testUserToken = generateAuthToken(testUser);
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
  async function createTestFile(itemId) {
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

  describe('DELETE /api/v1/internal/items/:id/permanent - Success Cases', () => {
    
    test('should permanently delete an item', async () => {
      // Create test item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Test Item to Delete',
        category: 'Electronics',
        price: 100.00
      }));

      const itemId = item._id;

      // Verify item exists
      expect(await Item.findById(itemId)).toBeTruthy();

      // Call hard delete endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/items/${itemId}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify response structure
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Item permanently deleted');
      expect(response.body.deleted).toHaveProperty('item_deleted');
      expect(response.body.deleted).toHaveProperty('files_deleted');
      expect(response.body.deleted.item_deleted).toBe(true);
      expect(response.body.deleted.files_deleted).toBe(0); // No file in this test

      // Verify item is permanently deleted from database
      expect(await Item.findById(itemId)).toBeNull();
    });

    test('should delete associated file when item has file_path', async () => {
      // Create item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item with File',
        category: 'Electronics',
        price: 100.00
      }));

      // Create test file and update item
      const filePath = await createTestFile(item._id);
      await Item.updateOne({ _id: item._id }, { file_path: filePath });

      // Verify file exists
      const fullPath = path.join(process.cwd(), filePath);
      await expect(fs.access(fullPath)).resolves.not.toThrow();

      // Call hard delete endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/items/${item._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify file is deleted
      await expect(fs.access(fullPath)).rejects.toThrow();
      expect(response.body.deleted.files_deleted).toBe(1);
      expect(response.body.deleted.item_deleted).toBe(true);

      // Verify item is deleted
      expect(await Item.findById(item._id)).toBeNull();
    });

    test('should handle item with null file_path gracefully', async () => {
      // Create item without file
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item without File',
        category: 'Books',
        price: 50.00
      }));

      // Verify item has null file_path
      const itemDoc = await Item.findById(item._id);
      expect(itemDoc.file_path).toBeNull();

      // Call hard delete endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/items/${item._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify successful deletion
      expect(response.body.deleted.item_deleted).toBe(true);
      expect(response.body.deleted.files_deleted).toBe(0);
      expect(await Item.findById(item._id)).toBeNull();
    });

    test('should handle missing file gracefully (file already deleted)', async () => {
      // Create item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item with Missing File',
        category: 'Electronics',
        price: 100.00
      }));

      // Set file_path but don't create actual file
      const filePath = `uploads/items/${item._id}_nonexistent.jpg`;
      await Item.updateOne({ _id: item._id }, { file_path: filePath });

      // Call hard delete endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/items/${item._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify item deleted, file count is 0 (file didn't exist)
      expect(response.body.deleted.item_deleted).toBe(true);
      expect(response.body.deleted.files_deleted).toBe(0);
      expect(await Item.findById(item._id)).toBeNull();
    });

    test('should preserve other items when deleting one', async () => {
      // Create multiple items
      const item1 = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item 1',
        category: 'Electronics',
        price: 100.00
      }));
      const item2 = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item 2',
        category: 'Books',
        price: 50.00
      }));
      const item3 = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item 3',
        category: 'Home',
        price: 75.00
      }));

      // Delete only item2
      await request(app)
        .delete(`/api/v1/internal/items/${item2._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify item2 is deleted
      expect(await Item.findById(item2._id)).toBeNull();

      // Verify other items are preserved
      expect(await Item.findById(item1._id)).toBeTruthy();
      expect(await Item.findById(item3._id)).toBeTruthy();
    });
  });

  // ============================================================================
  // ERROR CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/items/:id/permanent - Error Cases', () => {
    
    test('should return 401 when internal key is missing', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/internal/items/${fakeId}/permanent`)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 401 when internal key is invalid', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/internal/items/${fakeId}/permanent`)
        .set('x-internal-key', 'invalid-key')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Internal Safety Key');
    });

    test('should return 400 for invalid itemId format', async () => {
      const response = await request(app)
        .delete('/api/v1/internal/items/invalid-id/permanent')
        .set('x-internal-key', INTERNAL_KEY)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
      expect(response.body.error_type).toContain('Invalid ID format');
    });

    test('should return 404 when item does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/v1/internal/items/${fakeId}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
      expect(response.body.error_type).toBe('Not Found');
      expect(response.body.message).toContain('Item not found');
    });

    test('should return 404 when item is already deleted (race condition)', async () => {
      // Create item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item to Delete',
        category: 'Electronics',
        price: 100.00
      }));

      const itemId = item._id;

      // Delete item manually first (simulating race condition)
      await Item.deleteOne({ _id: itemId });

      // Try to delete again via endpoint
      const response = await request(app)
        .delete(`/api/v1/internal/items/${itemId}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
      expect(response.body.error_type).toBe('Not Found');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('DELETE /api/v1/internal/items/:id/permanent - Edge Cases', () => {
    
    test('should handle soft-deleted items (hard delete still works)', async () => {
      // Create and soft delete item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Soft Deleted Item',
        category: 'Electronics',
        price: 100.00
      }));

      // Soft delete it
      await Item.updateOne(
        { _id: item._id },
        { $set: { is_active: false, deleted_at: new Date() } }
      );

      // Verify it's soft deleted but still exists
      const softDeleted = await Item.findById(item._id);
      expect(softDeleted).toBeTruthy();
      expect(softDeleted.is_active).toBe(false);

      // Hard delete it
      const response = await request(app)
        .delete(`/api/v1/internal/items/${item._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify it's permanently deleted
      expect(response.body.deleted.item_deleted).toBe(true);
      expect(await Item.findById(item._id)).toBeNull();
    });

    test('should handle items with very long file paths', async () => {
      // Create item
      const item = await createItemViaAPI(testUserToken, generateMockItem({ 
        name: 'Item with Long Path',
        category: 'Electronics',
        price: 100.00
      }));

      // Create file with long path
      const longPath = `uploads/items/${item._id}_very-long-filename-that-might-cause-issues.jpg`;
      const fullPath = path.join(process.cwd(), longPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, 'test content');
      
      await Item.updateOne({ _id: item._id }, { file_path: longPath });

      // Hard delete
      const response = await request(app)
        .delete(`/api/v1/internal/items/${item._id}/permanent`)
        .set('x-internal-key', INTERNAL_KEY)
        .expect(200);

      // Verify deletion
      expect(response.body.deleted.item_deleted).toBe(true);
      expect(response.body.deleted.files_deleted).toBe(1);
      expect(await Item.findById(item._id)).toBeNull();
    });
  });
});
