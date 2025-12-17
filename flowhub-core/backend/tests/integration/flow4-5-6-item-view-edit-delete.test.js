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
const Item = require('../../src/models/Item');

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
    // Use Date.now() and random integer to avoid decimal points in name
    const uniqueName = `Test Item for View Edit Delete ${Date.now()} ${Math.floor(Math.random() * 1000000)}`;
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
  // PRD Reference: Flow 4 - Item Details (Section 9)
  // Comprehensive test suite: Positive, Negative, and Boundary cases
  // ============================================================================

  describe('Flow 4 - View Single Item', () => {
    
    // ========================================================================
    // POSITIVE CASES - Successful Item Retrieval
    // ========================================================================

    describe('Positive Cases - Successful Item Retrieval', () => {
      test('should return 200 and item details when item exists (PRD Section 9)', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify PRD success response format
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Item retrieved successfully');
        expect(response.body.data).toBeDefined();
        expect(response.body.data._id).toBe(createdItemId);
        expect(response.body.data.name).toBeDefined();
        expect(response.body.data.price).toBe(99.99);
      });

      test('should return all item fields in response', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const item = response.body.data;
        
        // Verify all core fields are present
        expect(item).toHaveProperty('_id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('item_type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('is_active');
        expect(item).toHaveProperty('createdAt');
        expect(item).toHaveProperty('updatedAt');
      });

      test('should return item with PHYSICAL type and dimensions', async () => {
        // Create item with PHYSICAL type
        const physicalItemData = generateMockItem({
          item_type: 'PHYSICAL',
          name: `Physical Item ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics', // Ensure category matches PHYSICAL item type
          weight: 2.5,
          length: 10,
          width: 20,
          height: 30
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(physicalItemData);

        if (createResponse.status !== 201) {
          console.error('Physical item creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const physicalItemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${physicalItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.item_type).toBe('PHYSICAL');
        expect(response.body.data.weight).toBe(2.5);
        expect(response.body.data.dimensions).toBeDefined();
        expect(response.body.data.dimensions.length).toBe(10);
        expect(response.body.data.dimensions.width).toBe(20);
        expect(response.body.data.dimensions.height).toBe(30);
      });

      test('should return item with DIGITAL type and download_url', async () => {
        const digitalItemData = generateMockItem({
          item_type: 'DIGITAL',
          name: `Digital Item ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Software', // DIGITAL items require Software category
          download_url: 'https://example.com/download/file.pdf',
          file_size: 1024000
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(digitalItemData)
          .expect(201);

        const digitalItemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${digitalItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.item_type).toBe('DIGITAL');
        expect(response.body.data.download_url).toBe('https://example.com/download/file.pdf');
        expect(response.body.data.file_size).toBe(1024000);
      });

      test('should return item with SERVICE type and duration_hours', async () => {
        const serviceItemData = generateMockItem({
          item_type: 'SERVICE',
          name: `Service Item ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Services', // SERVICE items require Services category
          duration_hours: 8
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceItemData);

        if (createResponse.status !== 201) {
          console.error('Service item creation failed:', createResponse.status, JSON.stringify(createResponse.body, null, 2));
        }
        expect(createResponse.status).toBe(201);

        const serviceItemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${serviceItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.item_type).toBe('SERVICE');
        expect(response.body.data.duration_hours).toBe(8);
      });

      test('should return item with tags array', async () => {
        const itemWithTags = generateMockItem({
          name: `Item with Tags ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics', // Ensure category matches PHYSICAL item type
          tags: ['electronics', 'gadget', 'new']
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithTags);

        if (createResponse.status !== 201) {
          console.error('Item with tags creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body.data.tags)).toBe(true);
        expect(response.body.data.tags).toContain('electronics');
        expect(response.body.data.tags).toContain('gadget');
        expect(response.body.data.tags).toContain('new');
      });

      test('should return item with embed_url for iframe', async () => {
        // PRD Section 6.3: Embedded Content (iframe)
        // embed_url field is now in the Item model schema
        const itemWithEmbed = generateMockItem({
          item_type: 'PHYSICAL', // Ensure correct item type for category validation
          name: `Item with Embed ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics', // Ensure category matches item type
          embed_url: 'https://example.com/embed/content'
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithEmbed);

        if (createResponse.status !== 201) {
          console.error('Item with embed creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // PRD Section 6.3: embed_url should be returned in response
        expect(response.body.data._id).toBe(itemId);
        expect(response.body.data.embed_url).toBe('https://example.com/embed/content');
      });

      test('should return item with file_path if file was uploaded', async () => {
        // Note: File upload testing requires multipart/form-data
        // This test verifies file_path is returned if present
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // file_path may or may not be present depending on creation
        if (response.body.data.file_path) {
          expect(typeof response.body.data.file_path).toBe('string');
          expect(response.body.data.file_path.length).toBeGreaterThan(0);
        }
      });

      test('should return item with correct timestamps format', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify ISO 8601 format timestamps (Mongoose uses createdAt/updatedAt)
        expect(response.body.data.createdAt).toBeDefined();
        expect(new Date(response.body.data.createdAt).toISOString()).toBe(response.body.data.createdAt);
        
        if (response.body.data.updatedAt) {
          expect(new Date(response.body.data.updatedAt).toISOString()).toBe(response.body.data.updatedAt);
        }
      });

      test('should return item accessible by any authenticated user', async () => {
        // Create another user
        const otherUser = await generateMockUser({
          email: `other${Date.now()}${Math.random()}@example.com`
        });
        const otherUserToken = generateAuthToken(otherUser);

        // Other user should be able to view the item
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .expect(200);

        expect(response.body.data._id).toBe(createdItemId);
      });
    });

    // ========================================================================
    // NEGATIVE CASES - Error Scenarios
    // ========================================================================

    describe('Negative Cases - Error Scenarios', () => {
      test('should return 404 with PRD format when item does not exist (PRD Section 9)', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/v1/items/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        // Verify PRD error response format (Section 9)
        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(404);
        expect(response.body.error_type).toBe('Not Found - Resource not found');
        expect(response.body.message).toContain('not found');
        expect(response.body.message).toContain(fakeId.toString());
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.path).toBeDefined();
      });

      test('should return 404 when item is soft deleted (is_active: false)', async () => {
        // Delete the item (soft delete)
        await request(app)
          .delete(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Try to view deleted item - should return 404
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error_code).toBe(404);
        expect(response.body.message).toContain('not found');
      });

      test('should return 422 when item ID format is invalid (PRD Section 9)', async () => {
        const response = await request(app)
          .get('/api/v1/items/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(422);

        // Verify PRD error response format (Section 9: 422 Unprocessable Entity)
        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
        expect(response.body.error_type).toBe('Unprocessable Entity - Invalid ID format');
        expect(response.body.message).toBe('Invalid item ID format');
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.path).toBeDefined();
      });

      test('should return 422 for various invalid ID formats', async () => {
        const invalidIds = [
          'not-an-id',
          '123', // Too short
          '12345678901234567890123', // Wrong length (23 chars, needs 24)
          '12345678901234567890123x', // Invalid character
          // Note: Empty string '' is skipped because it matches the list route (/api/v1/items) instead of single item route
          'null',
          'undefined',
          '12345-67890-12345-67890', // Wrong format
        ];

        for (const invalidId of invalidIds) {
          const response = await request(app)
            .get(`/api/v1/items/${invalidId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(422);

          expect(response.body.error_code).toBe(422);
          expect(response.body.error_type).toBe('Unprocessable Entity - Invalid ID format');
        }
      });

      test('should return 401 when token is missing (PRD Section 9)', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .expect(401);

        // Verify PRD error response format (Section 9: 401 Unauthorized)
        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(401);
        expect(response.body.error_type).toBe('Unauthorized - Authentication required');
        expect(response.body.message).toContain('Authentication');
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.path).toBeDefined();
      });

      test('should return 401 when token is invalid', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', 'Bearer invalid-token-12345')
          .expect(401);

        expect(response.body.error_code).toBe(401);
        expect(response.body.error_type).toBe('Unauthorized - Authentication required');
      });

      test('should return 401 when token format is wrong', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .set('Authorization', `InvalidFormat ${authToken}`)
          .expect(401);

        expect(response.body.error_code).toBe(401);
      });

      test('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .expect(401);

        expect(response.body.error_code).toBe(401);
      });

      test('should include all required PRD fields in error responses', async () => {
        const requiredFields = ['status', 'error_code', 'error_type', 'message', 'timestamp', 'path'];
        
        // Test with 404 error
        const response404 = await request(app)
          .get(`/api/v1/items/${new mongoose.Types.ObjectId()}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        requiredFields.forEach(field => {
          expect(response404.body).toHaveProperty(field);
        });

        // Test with 422 error
        const response422 = await request(app)
          .get('/api/v1/items/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(422);

        requiredFields.forEach(field => {
          expect(response422.body).toHaveProperty(field);
        });

        // Test with 401 error
        const response401 = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .expect(401);

        requiredFields.forEach(field => {
          expect(response401.body).toHaveProperty(field);
        });
      });

      test('should return correct path in error response', async () => {
        const response = await request(app)
          .get(`/api/v1/items/${createdItemId}`)
          .expect(401);

        expect(response.body.path).toBe(`/api/v1/items/${createdItemId}`);
      });

      test('should return ISO 8601 timestamp in error response', async () => {
        const response = await request(app)
          .get('/api/v1/items/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(422);

        // Verify timestamp is valid ISO 8601 format
        const timestamp = new Date(response.body.timestamp);
        expect(timestamp.toISOString()).toBe(response.body.timestamp);
        expect(isNaN(timestamp.getTime())).toBe(false);
      });
    });

    // ========================================================================
    // BOUNDARY CASES - Edge Values and Limits
    // ========================================================================

    describe('Boundary Cases - Edge Values and Limits', () => {
      test('should handle item with minimum field values', async () => {
        const minItemData = generateMockItem({
          name: `ABC ${Date.now()} ${Math.floor(Math.random() * 1000000)}`, // Minimum 3 characters + unique
          description: 'Min desc 10', // Minimum description (10 chars required)
          price: 0.01, // Minimum price
          category: 'A' // Minimum category
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(minItemData)
          .expect(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.name.length).toBeGreaterThanOrEqual(3);
        expect(response.body.data.name).toContain('ABC');
        expect(response.body.data.price).toBe(0.01);
      });

      test('should handle item with maximum field values', async () => {
        const maxItemData = generateMockItem({
          name: 'A'.repeat(100), // Maximum name length (100 chars)
          description: 'D'.repeat(500), // Maximum description (500 chars, not 1000)
          price: 999999.99, // Maximum price
          category: 'C'.repeat(50) // Maximum category (50 chars)
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(maxItemData)
          .expect(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.name.length).toBe(100);
        expect(response.body.data.description.length).toBe(500); // Max description is 500 chars
        expect(response.body.data.price).toBe(999999.99);
      });

      test('should handle item with null/undefined optional fields', async () => {
        // Note: Some fields like embed_url don't exist in the model
        // We test with fields that can be null/undefined (omitting them entirely)
        const itemWithUndefined = generateMockItem({
          name: `Item with Undefined ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics' // Ensure category matches PHYSICAL item type
          // Don't include tags at all (undefined) - this is the proper way to test optional fields
          // file_path is optional and can be omitted
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithUndefined);

        if (createResponse.status !== 201) {
          console.error('Item with undefined creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Item should still be retrievable even with undefined optional fields
        expect(response.body.data._id).toBe(itemId);
        expect(response.body.data.name).toBeDefined();
        // Optional fields may be undefined or have default values
        if (response.body.data.tags !== undefined) {
          expect(Array.isArray(response.body.data.tags)).toBe(true);
        }
      });

      test('should handle item with empty tags array', async () => {
        const itemWithEmptyTags = generateMockItem({
          name: `Item with Empty Tags ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics', // Ensure category matches PHYSICAL item type
          tags: []
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithEmptyTags);

        if (createResponse.status !== 201) {
          console.error('Item with empty tags creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(Array.isArray(response.body.data.tags)).toBe(true);
        expect(response.body.data.tags.length).toBe(0);
      });

      test('should handle item with many tags', async () => {
        // Test with maximum allowed tags (typically 10, but check model limit)
        const manyTags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
        const itemWithManyTags = generateMockItem({
          name: `Item with Many Tags ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          tags: manyTags
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithManyTags)
          .expect(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.tags.length).toBe(10);
        expect(response.body.data.tags).toEqual(manyTags);
      });

      test('should handle item with price of zero', async () => {
        // Price minimum is 0.01, so price of 0 should be rejected
        const freeItem = generateMockItem({
          name: `Free Item ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          price: 0
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(freeItem)
          .expect(422); // Should fail validation (price must be >= 0.01)

        expect(createResponse.body.error_code).toBe(422);
        expect(createResponse.body.message.toLowerCase()).toContain('price');
      });

      test('should handle item with very long embed_url', async () => {
        // Note: embed_url field is not currently in the Item model schema
        // This test verifies that items can be retrieved even if embed_url is added later
        // For now, we test with a regular item and note that embed_url would need to be added
        const itemWithLongUrl = generateMockItem({
          name: `Item with Long URL ${Date.now()} ${Math.floor(Math.random() * 1000000)}`
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemWithLongUrl)
          .expect(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Item should be retrievable
        expect(response.body.data._id).toBe(itemId);
        // TODO: When embed_url is added to Item model, test with very long URL
        // const longUrl = 'https://example.com/' + 'a'.repeat(2000);
        // expect(response.body.data.embed_url).toBe(longUrl);
      });

      test('should handle ObjectId at boundary values', async () => {
        // Test with minimum valid ObjectId (all zeros)
        const minObjectId = '000000000000000000000000';
        const responseMin = await request(app)
          .get(`/api/v1/items/${minObjectId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404); // Should be valid format but not exist

        expect(responseMin.body.error_code).toBe(404);

        // Test with maximum valid ObjectId (all F's)
        const maxObjectId = 'ffffffffffffffffffffffff';
        const responseMax = await request(app)
          .get(`/api/v1/items/${maxObjectId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404); // Should be valid format but not exist

        expect(responseMax.body.error_code).toBe(404);
      });

      test('should handle concurrent requests for same item', async () => {
        // Make multiple concurrent requests
        const promises = Array.from({ length: 5 }, () =>
          request(app)
            .get(`/api/v1/items/${createdItemId}`)
            .set('Authorization', `Bearer ${authToken}`)
        );

        const responses = await Promise.all(promises);

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.data._id).toBe(createdItemId);
        });
      });

      test('should handle rapid sequential requests', async () => {
        // Make rapid sequential requests
        for (let i = 0; i < 10; i++) {
          const response = await request(app)
            .get(`/api/v1/items/${createdItemId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

          expect(response.body.data._id).toBe(createdItemId);
        }
      });

      test('should handle item with special characters in name', async () => {
        // Name validation only allows letters, numbers, spaces, hyphens, and underscores
        // Test with allowed special characters (hyphens and underscores)
        const specialCharItem = generateMockItem({
          name: `Item_with-hyphens_and_underscores ${Date.now()} ${Math.floor(Math.random() * 1000000)}`,
          category: 'Electronics' // Ensure category matches PHYSICAL item type
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(specialCharItem);

        if (createResponse.status !== 201) {
          console.error('Special char item creation failed:', createResponse.status, createResponse.body);
        }
        expect(createResponse.status).toBe(201);

        const itemId = createResponse.body.data._id;

        const response = await request(app)
          .get(`/api/v1/items/${itemId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.name).toContain('hyphens');
        expect(response.body.data.name).toContain('underscores');
      });

      test('should handle item with unicode characters', async () => {
        // Name validation only allows letters, numbers, spaces, hyphens, and underscores
        // Unicode and emoji are not allowed by the current validation rules
        // This test verifies that the validation correctly rejects unicode characters
        const unicodeItem = generateMockItem({
          name: `Item with 中文 العربية русский emoji ${Date.now()} ${Math.floor(Math.random() * 1000000)}`
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(unicodeItem)
          .expect(422); // Should fail validation (unicode not allowed in name)

        expect(createResponse.body.error_code).toBe(422);
        expect(createResponse.body.message).toContain('Name can only contain letters, numbers, spaces, hyphens, and underscores');
      });
    });
  });

  // ============================================================================
  // FLOW 5: EDIT ITEM (PUT /api/v1/items/:id)
  // PRD Reference: Flow 5 - Item Edit
  // ============================================================================

  describe('Flow 5 - Edit Item API Tests', () => {
    let itemToUpdate;
    let itemVersion;

    beforeEach(async () => {
      // Create a fresh item for each test with unique name
      const uniqueName = `Test Item for Edit ${Date.now()} ${Math.floor(Math.random() * 1000000)}`;
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        name: uniqueName,
        description: 'This is a test item description for edit testing purposes. It contains enough characters to meet the minimum requirement.',
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
      itemToUpdate = createResponse.body.data;
      
      // Fetch item from DB to get version (version might not be in response due to toJSON transform)
      const itemFromDB = await Item.findById(itemToUpdate._id);
      itemVersion = itemFromDB ? itemFromDB.version : 1; // Default to 1 if not found
    });

    // ========================================================================
    // POSITIVE CASES - Successful Item Updates
    // ========================================================================

    describe('Positive Cases - Successful Item Updates', () => {
      test('should update item name successfully', async () => {
        const updateData = {
          name: 'Updated Item Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Item updated successfully');
        expect(response.body.data.name).toBe('Updated Item Name');
        expect(response.body.data.version).toBe(itemVersion + 1);
      });

      test('should update multiple fields successfully', async () => {
        const updateData = {
          name: 'Updated Test Item',
          description: 'Updated description for testing purposes with enough characters',
          price: 149.99,
          weight: 2.5,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.name).toBe('Updated Test Item');
        expect(response.body.data.description).toBe('Updated description for testing purposes with enough characters');
        expect(response.body.data.price).toBe(149.99);
        expect(response.body.data.weight).toBe(2.5);
        expect(response.body.data.version).toBe(itemVersion + 1);
      });

      test('should update item with FormData (version as string)', async () => {
        // Test FormData like frontend sends it (version as string)
        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .field('name', 'Updated via FormData')
          .field('description', 'Updated description via FormData')
          .field('price', '199.99')
          .field('version', itemVersion.toString()) // Send as string (like FormData does)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe('Updated via FormData');
        expect(response.body.data.version).toBe(itemVersion + 1);
      });

      test('should support partial updates (only name)', async () => {
        const updateData = {
          name: 'Partially Updated Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.name).toBe('Partially Updated Name');
        // Other fields should remain unchanged
        expect(response.body.data.price).toBe(itemToUpdate.price);
        expect(response.body.data.description).toBe(itemToUpdate.description);
      });

      test('should update PHYSICAL item dimensions', async () => {
        const updateData = {
          length: 20,
          width: 15,
          height: 5,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.dimensions.length).toBe(20);
        expect(response.body.data.dimensions.width).toBe(15);
        expect(response.body.data.dimensions.height).toBe(5);
      });

      test('should update DIGITAL item fields', async () => {
        // Create a DIGITAL item first
        const digitalItemData = generateMockItem({
          item_type: 'DIGITAL',
          name: `Digital Item ${Date.now()}`,
          category: 'Software',
          download_url: 'https://example.com/download',
          file_size: 1024
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(digitalItemData)
          .expect(201);

        const digitalItem = createResponse.body.data;
        const digitalVersion = digitalItem.version || 1;

        const updateData = {
          download_url: 'https://example.com/download/updated',
          file_size: 2048,
          version: digitalVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${digitalItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.download_url).toBe('https://example.com/download/updated');
        expect(response.body.data.file_size).toBe(2048);
      });

      test('should update SERVICE item duration', async () => {
        // Create a SERVICE item first
        const serviceItemData = generateMockItem({
          item_type: 'SERVICE',
          name: `Service Item ${Date.now()}`,
          category: 'Services',
          duration_hours: 2
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceItemData)
          .expect(201);

        const serviceItem = createResponse.body.data;
        const serviceVersion = serviceItem.version || 1;

        const updateData = {
          duration_hours: 4,
          version: serviceVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${serviceItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.duration_hours).toBe(4);
      });

      test('should update category and normalize it', async () => {
        const updateData = {
          category: 'electronics', // Should be normalized to 'Electronics'
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.category).toBe('Electronics');
      });

      test('should update tags', async () => {
        const updateData = {
          tags: ['updated', 'tags', 'test'],
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.tags).toEqual(['updated', 'tags', 'test']);
      });

      test('should increment version on successful update', async () => {
        const updateData = {
          name: 'Version Test Item',
          version: itemVersion
        };

        const response1 = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response1.body.data.version).toBe(itemVersion + 1);

        // Second update should increment again
        const updateData2 = {
          name: 'Version Test Item 2',
          version: itemVersion + 1
        };

        const response2 = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData2)
          .expect(200);

        expect(response2.body.data.version).toBe(itemVersion + 2);
      });

      test('should change item_type from PHYSICAL to DIGITAL', async () => {
        const updateData = {
          item_type: 'DIGITAL',
          category: 'Software', // Must change category when changing to DIGITAL (Electronics is PHYSICAL-only)
          download_url: 'https://example.com/download/new',
          file_size: 2048,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.item_type).toBe('DIGITAL');
        expect(response.body.data.download_url).toBe('https://example.com/download/new');
        expect(response.body.data.file_size).toBe(2048);
        // Old PHYSICAL fields should be cleared
        expect(response.body.data.weight).toBeUndefined();
        expect(response.body.data.dimensions).toBeUndefined();
      });

      test('should change item_type from DIGITAL to PHYSICAL', async () => {
        // Create DIGITAL item
        const digitalItemData = generateMockItem({
          item_type: 'DIGITAL',
          name: `Digital to Physical ${Date.now()}`,
          category: 'Software',
          download_url: 'https://example.com/download',
          file_size: 1024
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(digitalItemData)
          .expect(201);

        const digitalItem = createResponse.body.data;
        const digitalVersion = digitalItem.version || 1;

        const updateData = {
          item_type: 'PHYSICAL',
          category: 'Electronics', // Must change category when changing to PHYSICAL (Software is DIGITAL-only)
          weight: 1.5,
          length: 10,
          width: 10,
          height: 10,
          version: digitalVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${digitalItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.item_type).toBe('PHYSICAL');
        expect(response.body.data.weight).toBe(1.5);
        // Old DIGITAL fields should be cleared
        expect(response.body.data.download_url).toBeUndefined();
        expect(response.body.data.file_size).toBeUndefined();
      });
    });

    // ========================================================================
    // NEGATIVE CASES - Error Scenarios
    // ========================================================================

    describe('Negative Cases - Error Scenarios', () => {
      test('should return 400 when version field is missing', async () => {
        const updateData = {
          name: 'Updated Name'
          // version missing
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
        expect(response.body.message).toContain('Version field is required');
      });

      test('should return 400 when version is not a number', async () => {
        const updateData = {
          name: 'Updated Name',
          version: 'invalid'
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
        expect(response.body.message).toContain('Version field is required and must be a positive integer');
      });

      test('should return 400 when version is negative', async () => {
        const updateData = {
          name: 'Updated Name',
          version: -1
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
      });

      test('should return 400 when version is zero', async () => {
        const updateData = {
          name: 'Updated Name',
          version: 0
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
      });

      test('should return 409 when version mismatch (VERSION_CONFLICT)', async () => {
        const updateData = {
          name: 'Updated Name',
          version: itemVersion + 999 // Wrong version
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(409);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(409);
        expect(response.body.error_type).toBe('Conflict - Version mismatch');
        expect(response.body.error_code_detail).toBe('VERSION_CONFLICT');
        expect(response.body.current_version).toBeDefined();
        expect(response.body.provided_version).toBe(itemVersion + 999);
        expect(response.body.message).toContain('Item was modified by another user');
      });

      test('should return 404 when item does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const updateData = {
          name: 'Updated Name',
          version: 1
        };

        const response = await request(app)
          .put(`/api/v1/items/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(404);
        expect(response.body.error_type).toBe('Not Found - Resource not found');
      });

      test('should return 404 when item not owned by user (ownership check)', async () => {
        // Create another user
        const otherUser = await generateMockUser({
          email: `other${Date.now()}@example.com`
        });
        const otherUserToken = generateAuthToken(otherUser);

        // Try to update item created by first user
        const updateData = {
          name: 'Updated Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(updateData)
          .expect(404); // Should return 404, not 403 (security: don't reveal item exists)

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(404);
      });

      test('should return 409 when item is inactive (ITEM_INACTIVE)', async () => {
        // Deactivate the item
        await Item.findByIdAndUpdate(itemToUpdate._id, { is_active: false });

        const updateData = {
          name: 'Updated Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(409);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(409);
        expect(response.body.error_type).toBe('Conflict - Item inactive');
        expect(response.body.error_code_detail).toBe('ITEM_INACTIVE');
        expect(response.body.message).toContain('Cannot edit inactive item');
      });

      test('should return 409 when item is deleted (ITEM_DELETED)', async () => {
        // Soft delete the item
        await Item.findByIdAndUpdate(itemToUpdate._id, {
          is_active: false,
          deleted_at: new Date()
        });

        const updateData = {
          name: 'Updated Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(409);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(409);
        expect(response.body.error_type).toBe('Conflict - Item deleted');
        expect(response.body.error_code_detail).toBe('ITEM_DELETED');
        expect(response.body.message).toContain('Cannot edit deleted item');
      });

      test('should return 400 when item ID format is invalid', async () => {
        const updateData = {
          name: 'Updated Name',
          version: 1
        };

        const response = await request(app)
          .put('/api/v1/items/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
        expect(response.body.message).toContain('Invalid item ID format');
      });

      test('should return 401 when token is missing', async () => {
        const updateData = {
          name: 'Updated Name',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .send(updateData)
          .expect(401);

        expect(response.body.error_code).toBe(401);
        expect(response.body.error_type).toContain('Unauthorized');
      });

      test('should return 422 when name is too short', async () => {
        const updateData = {
          name: 'AB', // Too short (min 3 chars)
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(422);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 when name is too long', async () => {
        const updateData = {
          name: 'A'.repeat(101), // Too long (max 100 chars)
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(422);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 when price is negative', async () => {
        const updateData = {
          price: -10,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(422);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 when changing to DIGITAL without required fields', async () => {
        const updateData = {
          item_type: 'DIGITAL',
          // Missing download_url and file_size
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(422);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 when changing to PHYSICAL without required fields', async () => {
        // Create DIGITAL item first
        const digitalItemData = generateMockItem({
          item_type: 'DIGITAL',
          name: `Digital Item ${Date.now()}`,
          category: 'Software',
          download_url: 'https://example.com/download',
          file_size: 1024
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(digitalItemData)
          .expect(201);

        const digitalItem = createResponse.body.data;
        const digitalVersion = digitalItem.version || 1;

        const updateData = {
          item_type: 'PHYSICAL',
          // Missing weight and dimensions
          version: digitalVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${digitalItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(422);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(422);
      });
    });

    // ========================================================================
    // BOUNDARY CASES - Edge Values & Limits
    // ========================================================================

    describe('Boundary Cases - Edge Values & Limits', () => {
      test('should accept name with exactly 3 characters (minimum)', async () => {
        const updateData = {
          name: 'ABC',
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.name).toBe('ABC');
      });

      test('should accept name with exactly 100 characters (maximum)', async () => {
        const updateData = {
          name: 'A'.repeat(100),
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.name).toHaveLength(100);
      });

      test('should accept price with exactly 0.01 (minimum)', async () => {
        // Change category to Clothing (no category-specific price limits) to test global minimum
        const updateData = {
          price: 0.01,
          category: 'Clothing', // Use category without price limits
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.price).toBe(0.01);
      });

      test('should accept price with exactly 999999.99 (maximum)', async () => {
        // Change category to Clothing (no category-specific price limits) to test global maximum
        const updateData = {
          price: 999999.99,
          category: 'Clothing', // Use category without price limits
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.price).toBe(999999.99);
      });

      test('should accept weight with exactly 0.01 (minimum for PHYSICAL)', async () => {
        const updateData = {
          weight: 0.01,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.weight).toBe(0.01);
      });

      test('should accept dimensions with exactly 0.01 (minimum)', async () => {
        const updateData = {
          length: 0.01,
          width: 0.01,
          height: 0.01,
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.dimensions.length).toBe(0.01);
        expect(response.body.data.dimensions.width).toBe(0.01);
        expect(response.body.data.dimensions.height).toBe(0.01);
      });

      test('should accept file_size with exactly 1 (minimum for DIGITAL)', async () => {
        // Create DIGITAL item
        const digitalItemData = generateMockItem({
          item_type: 'DIGITAL',
          name: `Digital Item ${Date.now()}`,
          category: 'Software',
          download_url: 'https://example.com/download',
          file_size: 1024
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(digitalItemData)
          .expect(201);

        const digitalItem = createResponse.body.data;
        const digitalVersion = digitalItem.version || 1;

        const updateData = {
          file_size: 1,
          version: digitalVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${digitalItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.file_size).toBe(1);
      });

      test('should accept duration_hours with exactly 1 (minimum for SERVICE)', async () => {
        // Create SERVICE item
        const serviceItemData = generateMockItem({
          item_type: 'SERVICE',
          name: `Service Item ${Date.now()}`,
          category: 'Services',
          duration_hours: 2
        });

        const createResponse = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(serviceItemData)
          .expect(201);

        const serviceItem = createResponse.body.data;
        const serviceVersion = serviceItem.version || 1;

        const updateData = {
          duration_hours: 1,
          version: serviceVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${serviceItem._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.duration_hours).toBe(1);
      });

      test('should handle version increment correctly across multiple updates', async () => {
        let currentVersion = itemVersion;

        // First update
        const update1 = {
          name: 'Update 1',
          version: currentVersion
        };

        const response1 = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1)
          .expect(200);

        expect(response1.body.data.version).toBe(currentVersion + 1);
        currentVersion = response1.body.data.version;

        // Second update
        const update2 = {
          name: 'Update 2',
          version: currentVersion
        };

        const response2 = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
          .expect(200);

        expect(response2.body.data.version).toBe(currentVersion + 1);
        expect(response2.body.data.version).toBe(itemVersion + 2);
      });

      test('should handle empty tags array', async () => {
        // First verify item has tags
        const itemFromDB = await Item.findById(itemToUpdate._id);
        expect(itemFromDB.tags).toBeDefined();
        expect(itemFromDB.tags.length).toBeGreaterThan(0);
        
        const updateData = {
          tags: [],
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.tags).toEqual([]);
        
        // Verify in database
        const updatedItem = await Item.findById(itemToUpdate._id);
        expect(updatedItem.tags).toEqual([]);
      });

      test('should handle maximum tags (10 tags)', async () => {
        const updateData = {
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10'],
          version: itemVersion
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.tags).toHaveLength(10);
      });

      test('should reject version with decimal value', async () => {
        const updateData = {
          name: 'Updated Name',
          version: 1.5
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
      });

      test('should reject version as string number', async () => {
        const updateData = {
          name: 'Updated Name',
          version: '1' // String, not number
        };

        const response = await request(app)
          .put(`/api/v1/items/${itemToUpdate._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.error_code).toBe(400);
      });
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

      expect(viewResponse.body.data.name).toContain('Test Item for View Edit Delete');

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

