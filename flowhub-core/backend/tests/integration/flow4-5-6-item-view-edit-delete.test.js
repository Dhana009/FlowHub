/**
 * Flow 4, 5, 6 - Item View, Edit, Delete API Tests
 * 
 * Comprehensive test suite covering:
 * - Flow 4: View single item (GET /api/v1/items/:id)
 * - Flow 5: Edit item (PUT /api/v1/items/:id)
 * - Flow 6: Delete item (DELETE /api/v1/items/:id)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser, generateMockItem, generateAuthToken } = require('../helpers/mockData');
const app = require('../../src/app');

describe('Flow 4, 5, 6 - Item View, Edit, Delete API Tests', () => {
  let authToken;
  let testUser;
  let testUserId;
  let createdItemId;

  beforeAll(async () => {
    await setupTestDB();
    testUser = await generateMockUser();
    testUserId = testUser._id.toString();
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    // Recreate test user with unique email
    testUser = await generateMockUser({
      email: `test${Date.now()}${Math.random()}@example.com`
    });
    testUserId = testUser._id.toString();
    authToken = generateAuthToken(testUser);

    // Create a test item for view/edit/delete tests
    const uniqueName = `Test Item for View/Edit/Delete ${Date.now()} ${Math.random()}`;
    const itemData = generateMockItem({
      item_type: 'PHYSICAL',
      name: uniqueName,
      description: 'This is a test item description for view, edit, and delete testing purposes. It contains enough characters to meet the minimum requirement.',
      category: 'Electronics',
      price: 99.99,
      weight: 1.0,
      length: 10,
      width: 10,
      height: 10
    });

    const createResponse = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send(itemData);

    if (createResponse.status !== 201) {
      console.error('Item creation failed:', createResponse.status, createResponse.body);
    }
    expect(createResponse.status).toBe(201);
    createdItemId = createResponse.body.data._id;
  });

  // ============================================================================
  // FLOW 4: VIEW SINGLE ITEM (GET /api/v1/items/:id)
  // ============================================================================

  describe('Flow 4 - View Single Item', () => {
    test('should return 200 and item details when item exists', async () => {
      const response = await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Item retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(createdItemId);
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.price).toBe(99.99);
    });

    test('should return 404 when item does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    test('should return 400 when item ID format is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/items/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
      expect(response.body.message).toContain('Invalid item ID format');
    });

    test('should return 401 when token is missing', async () => {
      const response = await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .expect(401);

      expect(response.body.error_code).toBe(401);
      expect(response.body.message).toContain('Authentication');
    });
  });

  // ============================================================================
  // FLOW 5: EDIT ITEM (PUT /api/v1/items/:id)
  // ============================================================================

  describe('Flow 5 - Edit Item', () => {
    test('should return 200 and update item successfully', async () => {
      const updateData = {
        name: 'Updated Test Item Name',
        description: 'Updated description for testing',
        price: 149.99,
        weight: 2.5
      };

      const response = await request(app)
        .put(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Item updated successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Updated Test Item Name');
      expect(response.body.data.price).toBe(149.99);
      expect(response.body.data.weight).toBe(2.5);
    });

    test('should return 404 when item does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/v1/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
    });

    test('should return 400 when item ID format is invalid', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/v1/items/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
    });

    test('should return 422 when validation fails', async () => {
      const updateData = {
        name: 'AB', // Too short (min 3 chars)
        price: -10 // Invalid price
      };

      const response = await request(app)
        .put(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(422);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(422);
      expect(response.body.errors).toBeDefined();
    });

    test('should return 401 when token is missing', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/v1/items/${createdItemId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error_code).toBe(401);
    });
  });

  // ============================================================================
  // FLOW 6: DELETE ITEM (DELETE /api/v1/items/:id)
  // ============================================================================

  describe('Flow 6 - Delete Item', () => {
    test('should return 200 and soft delete item successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Item deleted successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.is_active).toBe(false);

      // Verify item is not accessible via GET
      await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 404 when item does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/items/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(404);
    });

    test('should return 409 when item is already deleted', async () => {
      // Delete the item first
      await request(app)
        .delete(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(409);
      expect(response.body.message).toContain('already deleted');
    });

    test('should return 400 when item ID format is invalid', async () => {
      const response = await request(app)
        .delete('/api/v1/items/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.error_code).toBe(400);
    });

    test('should return 401 when token is missing', async () => {
      const response = await request(app)
        .delete(`/api/v1/items/${createdItemId}`)
        .expect(401);

      expect(response.body.error_code).toBe(401);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS: View -> Edit -> Delete Flow
  // ============================================================================

  describe('Integration Tests - Complete Flow', () => {
    test('should complete full flow: view -> edit -> delete', async () => {
      // Step 1: View item
      const viewResponse = await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(viewResponse.body.data.name).toBe('Test Item for View/Edit/Delete');

      // Step 2: Edit item
      const updateData = {
        name: 'Final Updated Name',
        price: 199.99
      };

      const editResponse = await request(app)
        .put(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(editResponse.body.data.name).toBe('Final Updated Name');
      expect(editResponse.body.data.price).toBe(199.99);

      // Step 3: Verify edit by viewing again
      const viewAfterEdit = await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(viewAfterEdit.body.data.name).toBe('Final Updated Name');

      // Step 4: Delete item
      const deleteResponse = await request(app)
        .delete(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Item deleted successfully');

      // Step 5: Verify deletion - should return 404
      await request(app)
        .get(`/api/v1/items/${createdItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

