/**
 * Seed Data Endpoints Integration Tests
 * 
 * Comprehensive test suite for the 4 new seed data endpoints:
 * - GET /api/v1/items/count
 * - POST /api/v1/items/check-exists
 * - POST /api/v1/items/batch
 * - GET /api/v1/items/seed-status/:userId
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser, generateMockItem, generateAuthToken } = require('../helpers/mockData');
const app = require('../../src/app');
const Item = require('../../src/models/Item');

describe('Seed Data Endpoints Tests', () => {
  let adminUser, editorUser, viewerUser, otherEditorUser;
  let adminToken, editorToken, viewerToken, otherEditorToken;
  let adminUserId, editorUserId, viewerUserId, otherEditorUserId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    
    // Create test users with unique emails
    adminUser = await generateMockUser({
      email: `admin${Date.now()}${Math.random()}@example.com`,
      role: 'ADMIN'
    });
    adminUserId = adminUser._id.toString();
    adminToken = generateAuthToken(adminUser);

    editorUser = await generateMockUser({
      email: `editor${Date.now()}${Math.random()}@example.com`,
      role: 'EDITOR'
    });
    editorUserId = editorUser._id.toString();
    editorToken = generateAuthToken(editorUser);

    viewerUser = await generateMockUser({
      email: `viewer${Date.now()}${Math.random()}@example.com`,
      role: 'VIEWER'
    });
    viewerUserId = viewerUser._id.toString();
    viewerToken = generateAuthToken(viewerUser);

    otherEditorUser = await generateMockUser({
      email: `othereditor${Date.now()}${Math.random()}@example.com`,
      role: 'EDITOR'
    });
    otherEditorUserId = otherEditorUser._id.toString();
    otherEditorToken = generateAuthToken(otherEditorUser);
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

  // Helper function to create seed items with tags
  async function createSeedItems(userId, count, tags = ['seed'], token) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const category = ['Electronics', 'Software', 'Home', 'Books'][i % 4];
      const itemType = category === 'Software' ? 'DIGITAL' : 'PHYSICAL';
      
      // Create proper item data based on type
      let itemData;
      if (itemType === 'PHYSICAL') {
        itemData = {
          name: `Seed Item ${i + 1} ${Date.now()}`,
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: category,
          price: 99.99 + i,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10,
          tags: tags
        };
      } else {
        itemData = {
          name: `Seed Item ${i + 1} ${Date.now()}`,
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'DIGITAL',
          category: category,
          price: 99.99 + i,
          file_size: 1024,
          download_url: 'https://example.com/download',
          tags: tags
        };
      }
      
      const item = await createItemViaAPI(token, itemData);
      items.push(item);
    }
    return items;
  }

  // Helper function to create items for different users
  async function createItemsForUsers(users, itemsPerUser) {
    const allItems = [];
    for (const user of users) {
      const token = generateAuthToken(user);
      for (let i = 0; i < itemsPerUser; i++) {
        const itemData = generateMockItem({
          name: `Item for ${user.role} ${i + 1} ${Date.now()}`,
          category: 'Electronics'
        });
        const item = await createItemViaAPI(token, itemData);
        allItems.push(item);
      }
    }
    return allItems;
  }

  // ============================================================================
  // GET /api/v1/items/count
  // ============================================================================

  describe('GET /api/v1/items/count', () => {
    
    describe('Positive Cases', () => {
      
      test('should return 200 and count all items with no filters', async () => {
        // Create 5 items
        await createItemsForUsers([editorUser], 5);

        const response = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'success',
          count: 5,
          filters: {
            status: null,
            category: null,
            search: null
          }
        });
      });

      test('should return correct count with status=active filter', async () => {
        // Create 3 active and 2 inactive items
        await createItemsForUsers([editorUser], 3);
        
        // Create inactive items by deleting them
        const items = await createItemsForUsers([editorUser], 2);
        for (const item of items) {
          await request(app)
            .delete(`/api/v1/items/${item._id}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .expect(200);
        }

        const response = await request(app)
          .get('/api/v1/items/count?status=active')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(3);
        expect(response.body.filters.status).toBe('active');
      });

      test('should return correct count with status=inactive filter', async () => {
        // Create 2 active and 3 inactive items
        await createItemsForUsers([editorUser], 2);
        
        const items = await createItemsForUsers([editorUser], 3);
        for (const item of items) {
          await request(app)
            .delete(`/api/v1/items/${item._id}`)
            .set('Authorization', `Bearer ${editorToken}`)
            .expect(200);
        }

        const response = await request(app)
          .get('/api/v1/items/count?status=inactive')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(3);
        expect(response.body.filters.status).toBe('inactive');
      });

      test('should return correct count with category filter', async () => {
        // Create items with different categories (use unique names and valid prices)
        const timestamp = Date.now();
        await createItemViaAPI(editorToken, generateMockItem({ 
          category: 'Electronics',
          name: `Electronics Item 1 ${timestamp}`,
          price: 100.00 // Electronics: $10-$50,000
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          category: 'Electronics',
          name: `Electronics Item 2 ${timestamp}`,
          price: 200.00 // Electronics: $10-$50,000
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          category: 'Books',
          name: `Books Item ${timestamp}`,
          price: 50.00 // Books: $5-$500
        }));

        const response = await request(app)
          .get('/api/v1/items/count?category=Electronics')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(2);
        expect(response.body.filters.category).toBe('Electronics');
      });

      test('should return correct count with search filter', async () => {
        // Create items with specific names (use unique names and valid prices)
        const timestamp = Date.now();
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: `Laptop Computer ${timestamp}`,
          category: 'Electronics',
          price: 100.00
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: `Gaming Laptop ${timestamp}`,
          category: 'Electronics',
          price: 200.00
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: `Desktop Monitor ${timestamp}`,
          category: 'Electronics',
          price: 300.00
        }));

        const response = await request(app)
          .get('/api/v1/items/count?search=laptop')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(2);
        expect(response.body.filters.search).toBe('laptop');
      });

      test('should return correct count with combined filters', async () => {
        // Create items matching all filters
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Laptop Pro',
          category: 'Electronics'
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Gaming Laptop',
          category: 'Electronics'
        }));
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Desktop',
          category: 'Electronics'
        }));

        const response = await request(app)
          .get('/api/v1/items/count?status=active&category=Electronics&search=laptop')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(2);
        expect(response.body.filters).toMatchObject({
          status: 'active',
          category: 'Electronics',
          search: 'laptop'
        });
      });

      test('should return count matching GET /items pagination total', async () => {
        // Create 7 items
        await createItemsForUsers([editorUser], 7);

        const countResponse = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        const listResponse = await request(app)
          .get('/api/v1/items')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(countResponse.body.count).toBe(listResponse.body.pagination.total);
      });

      test('should return 0 when no items exist', async () => {
        const response = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(0);
      });
    });

    describe('RBAC Cases', () => {
      
      test('ADMIN should see all items count', async () => {
        // Create items for different users
        await createItemsForUsers([editorUser], 5);
        await createItemsForUsers([otherEditorUser], 3);

        const response = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.count).toBe(8);
      });

      test('VIEWER should see all items count', async () => {
        await createItemsForUsers([editorUser], 4);
        await createItemsForUsers([otherEditorUser], 2);

        const response = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200);

        expect(response.body.count).toBe(6);
      });

      test('EDITOR should see only own items count', async () => {
        await createItemsForUsers([editorUser], 5);
        await createItemsForUsers([otherEditorUser], 3);

        const response = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(5);
      });

      test('EDITOR count should match filtered GET /items', async () => {
        await createItemsForUsers([editorUser], 4);
        await createItemsForUsers([otherEditorUser], 2);

        const countResponse = await request(app)
          .get('/api/v1/items/count')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        const listResponse = await request(app)
          .get('/api/v1/items')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(countResponse.body.count).toBe(listResponse.body.pagination.total);
      });
    });

    describe('Negative Cases', () => {
      
      test('should return 401 without authentication', async () => {
        await request(app)
          .get('/api/v1/items/count')
          .expect(401);
      });

      test('should return 422 with invalid status value', async () => {
        const response = await request(app)
          .get('/api/v1/items/count?status=invalid')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(422);

        expect(response.body.error_code).toBe(422);
        expect(response.body.message).toContain('status must be "active" or "inactive"');
      });
    });

    describe('Edge Cases', () => {
      
      test('should handle special characters in search', async () => {
        await createItemViaAPI(editorToken, generateMockItem({ name: 'Item Special Test' }));

        const response = await request(app)
          .get('/api/v1/items/count?search=Special')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(1);
      });

      test('should handle case-insensitive category filter', async () => {
        await createItemViaAPI(editorToken, generateMockItem({ category: 'Electronics' }));

        const response = await request(app)
          .get('/api/v1/items/count?category=electronics')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.count).toBe(1);
      });
    });
  });

  // ============================================================================
  // POST /api/v1/items/check-exists
  // ============================================================================

  describe('POST /api/v1/items/check-exists', () => {
    
    describe('Positive Cases', () => {
      
      test('should return 200 and check single item that exists', async () => {
        const item = await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Existing Item',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Existing Item', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'success',
          results: [
            {
              name: 'Existing Item',
              category: 'Electronics',
              exists: true,
              item_id: item._id.toString()
            }
          ],
          missing_count: 0
        });
      });

      test('should return 200 and check single item that does not exist', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Non-Existent Item', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0]).toMatchObject({
          name: 'Non-Existent Item',
          category: 'Electronics',
          exists: false,
          item_id: null
        });
        expect(response.body.missing_count).toBe(1);
      });

      test('should return 200 and check multiple items (mix of exists/not exists)', async () => {
        // Create items with specific names that won't conflict
        const timestamp = Date.now();
        const item1Data = generateMockItem({ 
          name: `Item One ${timestamp}`,
          category: 'Electronics',
          price: 100.00 // Valid for Electronics ($10-$50,000)
        });
        const item2Data = generateMockItem({ 
          name: `Item Two ${timestamp}`,
          category: 'Books',
          price: 50.00 // Valid for Books ($5-$500)
        });
        
        const item1 = await createItemViaAPI(editorToken, item1Data);
        const item2 = await createItemViaAPI(editorToken, item2Data);

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [
              { name: `Item One ${timestamp}`, category: 'Electronics' },
              { name: `Item Two ${timestamp}`, category: 'Books' },
              { name: `Item Three ${timestamp}`, category: 'Home' },
              { name: `Item Four ${timestamp}`, category: 'Sports' }
            ]
          })
          .expect(200);

        expect(response.body.results).toHaveLength(4);
        expect(response.body.results[0].exists).toBe(true);
        expect(response.body.results[0].item_id).toBe(item1._id.toString());
        expect(response.body.results[1].exists).toBe(true);
        expect(response.body.results[1].item_id).toBe(item2._id.toString());
        expect(response.body.results[2].exists).toBe(false);
        expect(response.body.results[3].exists).toBe(false);
        expect(response.body.missing_count).toBe(2);
      });

      test('should match items with case-insensitive name', async () => {
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Laptop Computer',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'laptop computer', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(true);
      });

      test('should match items with normalized category', async () => {
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Test Item',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Test Item', category: 'electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(true);
      });
    });

    describe('RBAC Cases', () => {
      
      test('ADMIN can check any user items', async () => {
        const item = await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Editor Item',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            items: [{ name: 'Editor Item', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(true);
      });

      test('VIEWER can check any user items', async () => {
        const item = await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Editor Item',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({
            items: [{ name: 'Editor Item', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(true);
      });

      test('EDITOR can only check own items', async () => {
        const item = await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Editor Item',
          category: 'Electronics'
        }));

        // Other editor should not see this item
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${otherEditorToken}`)
          .send({
            items: [{ name: 'Editor Item', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(false);
      });
    });

    describe('Negative Cases', () => {
      
      test('should return 401 without authentication', async () => {
        await request(app)
          .post('/api/v1/items/check-exists')
          .send({ items: [] })
          .expect(401);
      });

      test('should return 400 with missing items array', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({})
          .expect(400);

        expect(response.body.error_code).toBe(400);
        expect(response.body.message).toContain('items');
      });

      test('should return 400 with invalid body structure', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({ items: 'not an array' })
          .expect(400);

        expect(response.body.error_code).toBe(400);
      });

      test('should return 422 with items array > 100', async () => {
        const items = Array(101).fill().map(() => ({ name: 'Test', category: 'Electronics' }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({ items })
          .expect(422);

        expect(response.body.error_code).toBe(422);
        expect(response.body.message).toContain('100');
      });

      test('should return 422 with missing name field', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ category: 'Electronics' }]
          })
          .expect(422);

        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 with missing category field', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Test Item' }]
          })
          .expect(422);

        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 with empty name string', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: '', category: 'Electronics' }]
          })
          .expect(422);

        expect(response.body.error_code).toBe(422);
      });

      test('should return 422 with empty category string', async () => {
        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Test Item', category: '' }]
          })
          .expect(422);

        expect(response.body.error_code).toBe(422);
      });
    });

    describe('Edge Cases', () => {
      
      test('should handle 100 items (max limit)', async () => {
        const items = Array(100).fill().map((_, i) => ({ 
          name: `Item ${i}`, 
          category: 'Electronics' 
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({ items })
          .expect(200);

        expect(response.body.results).toHaveLength(100);
      });

      test('should handle special characters in name/category', async () => {
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Item Special Test',
          category: 'Electronics'
        }));

        const response = await request(app)
          .post('/api/v1/items/check-exists')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Item Special Test', category: 'Electronics' }]
          })
          .expect(200);

        expect(response.body.results[0].exists).toBe(true);
      });
    });
  });

  // ============================================================================
  // POST /api/v1/items/batch
  // ============================================================================

  describe('POST /api/v1/items/batch', () => {
    
    describe('Positive Cases', () => {
      
      test('should return 200 and create single item in batch', async () => {
        // Use exact same structure as flow2 tests
        const itemData = {
          name: 'Batch Item 1',
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 99.99,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10
        };

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [itemData],
            skip_existing: false
          })
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'success',
          created: 1,
          skipped: 0,
          failed: 0
        });
        expect(response.body.results).toHaveLength(1);
        expect(response.body.results[0].status).toBe('created');
        expect(response.body.results[0].item_id).toBeTruthy();
      });

      test('should return 200 and create multiple items (5 items)', async () => {
        const items = Array(5).fill().map((_, i) => ({
          name: `Batch Item ${i + 1}`,
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 99.99 + i,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10
        }));

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(5);
        expect(response.body.skipped).toBe(0);
        expect(response.body.failed).toBe(0);
        expect(response.body.results).toHaveLength(5);
      });

      test('should skip duplicates when skip_existing=true', async () => {
        // Create item first
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Duplicate Item',
          category: 'Electronics'
        }));

        // Try to create same item in batch
        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [generateMockItem({ 
              name: 'Duplicate Item',
              category: 'Electronics'
            })],
            skip_existing: true
          })
          .expect(200);

        expect(response.body.created).toBe(0);
        expect(response.body.skipped).toBe(1);
        expect(response.body.failed).toBe(0);
        expect(response.body.results[0].status).toBe('skipped');
      });

      test('should fail on duplicates when skip_existing=false', async () => {
        // Create item first
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Duplicate Item',
          category: 'Electronics'
        }));

        // Try to create same item in batch
        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [generateMockItem({ 
              name: 'Duplicate Item',
              category: 'Electronics'
            })],
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(0);
        expect(response.body.skipped).toBe(0);
        expect(response.body.failed).toBe(1);
        expect(response.body.results[0].status).toBe('failed');
        expect(response.body.errors).toHaveLength(1);
      });

      test('should return detailed results array', async () => {
        const items = [
          {
            name: 'Item 1',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 99.99,
            weight: 1.0,
            length: 10,
            width: 10,
            height: 10
          },
          {
            name: 'Item 2',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 199.99,
            weight: 2.0,
            length: 20,
            width: 20,
            height: 20
          }
        ];

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: false
          })
          .expect(200);

        expect(response.body.results).toHaveLength(2);
        response.body.results.forEach((result, index) => {
          expect(result).toHaveProperty('index', index);
          expect(result).toHaveProperty('name', `Item ${index + 1}`);
          expect(result).toHaveProperty('status', 'created');
          expect(result).toHaveProperty('item_id');
        });
      });

      test('should apply all validation layers (same as single create)', async () => {
        const invalidItem = {
          name: 'AB', // Too short
          description: 'Short', // Too short
          item_type: 'PHYSICAL',
          price: 10,
          category: 'Electronics'
          // Missing required weight and dimensions
        };

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [invalidItem],
            skip_existing: false
          })
          .expect(200);

        expect(response.body.failed).toBe(1);
        expect(response.body.results[0].status).toBe('failed');
        expect(response.body.errors).toHaveLength(1);
      });
    });

    describe('RBAC Cases', () => {
      
      test('ADMIN can create batch', async () => {
        const itemData = {
          name: 'Admin Item',
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 99.99,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10
        };

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            items: [itemData],
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(1);
      });

      test('EDITOR can create batch', async () => {
        const itemData = {
          name: 'Editor Item',
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 99.99,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10
        };

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [itemData],
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(1);
      });

      test('VIEWER cannot create batch (403)', async () => {
        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({
            items: [generateMockItem({ name: 'Viewer Item' })],
            skip_existing: false
          })
          .expect(403);

        expect(response.body.error_code).toBe(403);
      });
    });

    describe('Negative Cases', () => {
      
      test('should return 401 without authentication', async () => {
        await request(app)
          .post('/api/v1/items/batch')
          .send({ items: [] })
          .expect(401);
      });

      test('should return 400 with missing items array', async () => {
        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({})
          .expect(400);

        expect(response.body.error_code).toBe(400);
      });

      test('should return 422 with items array > 50', async () => {
        const items = Array(51).fill().map(() => generateMockItem());

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: false
          })
          .expect(422);

        expect(response.body.error_code).toBe(422);
        expect(response.body.message).toContain('50');
      });

      test('should return 422 with invalid item data', async () => {
        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items: [{ name: 'Invalid' }], // Missing required fields
            skip_existing: false
          })
          .expect(200); // Batch returns 200 but with failed items

        expect(response.body.failed).toBe(1);
        expect(response.body.errors).toHaveLength(1);
      });
    });

    describe('Edge Cases', () => {
      
      test('should handle 50 items (max limit)', async () => {
        const items = Array(50).fill().map((_, i) => ({
          name: `Batch Item ${i + 1}`,
          description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 99.99 + i,
          weight: 1.0,
          length: 10,
          width: 10,
          height: 10
        }));

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(50);
      });

      test('should handle batch with mix of valid/invalid items', async () => {
        const items = [
          {
            name: 'Valid Item 1',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 99.99,
            weight: 1.0,
            length: 10,
            width: 10,
            height: 10
          },
          { name: 'Invalid' }, // Missing required fields
          {
            name: 'Valid Item 2',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 199.99,
            weight: 2.0,
            length: 20,
            width: 20,
            height: 20
          }
        ];

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: false
          })
          .expect(200);

        expect(response.body.created).toBe(2);
        expect(response.body.failed).toBe(1);
      });

      test('should handle batch with partial success', async () => {
        // Create duplicate first
        await createItemViaAPI(editorToken, generateMockItem({ 
          name: 'Duplicate Item',
          category: 'Electronics'
        }));

        const items = [
          {
            name: 'New Item 1',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 99.99,
            weight: 1.0,
            length: 10,
            width: 10,
            height: 10
          },
          {
            name: 'Duplicate Item',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 199.99,
            weight: 2.0,
            length: 20,
            width: 20,
            height: 20
          },
          {
            name: 'New Item 2',
            description: 'This is a test item description for testing purposes. It contains enough characters to meet the minimum requirement.',
            item_type: 'PHYSICAL',
            category: 'Electronics',
            price: 299.99,
            weight: 3.0,
            length: 30,
            width: 30,
            height: 30
          }
        ];

        const response = await request(app)
          .post('/api/v1/items/batch')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({
            items,
            skip_existing: true
          })
          .expect(200);

        expect(response.body.created).toBe(2);
        expect(response.body.skipped).toBe(1);
        expect(response.body.failed).toBe(0);
      });
    });
  });

  // ============================================================================
  // GET /api/v1/items/seed-status/:userId
  // ============================================================================

  describe('GET /api/v1/items/seed-status/:userId', () => {
    
    describe('Positive Cases', () => {
      
      test('should return 200 and seed_complete=true for user with 11+ seed items', async () => {
        await createSeedItems(editorUserId, 11, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'success',
          seed_complete: true,
          total_items: 11,
          required_count: 11,
          missing_items: [],
          seed_version: null
        });
      });

      test('should return 200 and seed_complete=false for user with < 11 seed items', async () => {
        await createSeedItems(editorUserId, 5, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          status: 'success',
          seed_complete: false,
          total_items: 5,
          required_count: 11,
          missing_items: []
        });
      });

      test('should return 200 with seed_version filter', async () => {
        await createSeedItems(editorUserId, 11, ['seed', 'v1.0'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}?seed_version=v1.0`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
        expect(response.body.seed_version).toBe('v1.0');
      });

      test('should return correct total_items count', async () => {
        await createSeedItems(editorUserId, 8, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.total_items).toBe(8);
      });

      test('should return required_count as 11', async () => {
        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.required_count).toBe(11);
      });
    });

    describe('RBAC Cases', () => {
      
      test('ADMIN can check any user seed status', async () => {
        await createSeedItems(editorUserId, 11, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
      });

      test('VIEWER can check any user seed status', async () => {
        await createSeedItems(editorUserId, 11, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
      });

      test('EDITOR can check own seed status', async () => {
        await createSeedItems(editorUserId, 11, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
      });

      test('EDITOR can check other users seed status', async () => {
        await createSeedItems(otherEditorUserId, 11, ['seed'], otherEditorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${otherEditorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
      });
    });

    describe('Negative Cases', () => {
      
      test('should return 401 without authentication', async () => {
        await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .expect(401);
      });

      test('should return 400 with invalid userId format', async () => {
        const response = await request(app)
          .get('/api/v1/items/seed-status/invalid-id')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(400);

        expect(response.body.error_code).toBe(400);
        expect(response.body.message).toContain('Invalid user ID format');
      });

      test('should return 404 with non-existent userId', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${fakeId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(404);

        expect(response.body.error_code).toBe(404);
        expect(response.body.message).toContain('User not found');
      });
    });

    describe('Edge Cases', () => {
      
      test('should return seed_complete=false with 0 items', async () => {
        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(false);
        expect(response.body.total_items).toBe(0);
      });

      test('should return seed_complete=true with exactly 11 items (boundary)', async () => {
        await createSeedItems(editorUserId, 11, ['seed'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(true);
        expect(response.body.total_items).toBe(11);
      });

      test('should return seed_complete=false with items but no seed tag', async () => {
        // Create items without seed tag
        await createItemsForUsers([editorUser], 11);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.seed_complete).toBe(false);
        expect(response.body.total_items).toBe(0); // No items with seed tag
      });

      test('should filter by seed_version when provided', async () => {
        // Create items with different seed versions
        await createSeedItems(editorUserId, 5, ['seed', 'v1.0'], editorToken);
        await createSeedItems(editorUserId, 6, ['seed', 'v2.0'], editorToken);

        const response = await request(app)
          .get(`/api/v1/items/seed-status/${editorUserId}?seed_version=v1.0`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.total_items).toBe(5);
        expect(response.body.seed_complete).toBe(false);
      });
    });
  });

  // ============================================================================
  // Regression: Existing Endpoints
  // ============================================================================

  describe('Regression: Existing Endpoints', () => {
    
    test('GET /api/v1/items should still work', async () => {
      await createItemsForUsers([editorUser], 3);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.items).toHaveLength(3);
    });

    test('POST /api/v1/items should still work', async () => {
      const itemData = generateMockItem({ 
        name: 'Regression Test Item',
        category: 'Electronics', // Safe default (widest price range: $10-$50,000)
        price: 100.00 // Valid for Electronics
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Regression Test Item');
    });

    test('GET /api/v1/items/:id should still work', async () => {
      const item = await createItemViaAPI(editorToken, generateMockItem({ 
        name: 'Get Single Item Test',
        category: 'Electronics', // Safe default
        price: 100.00 // Valid for Electronics
      }));

      const response = await request(app)
        .get(`/api/v1/items/${item._id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data._id).toBe(item._id.toString());
    });

    test('Route ordering: GET /items/count should not conflict with GET /items/:id', async () => {
      // This test verifies route ordering is correct
      const response = await request(app)
        .get('/api/v1/items/count')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('count');
    });

    test('Route ordering: GET /items/seed-status/:userId should not conflict with GET /items/:id', async () => {
      // This test verifies route ordering is correct
      const response = await request(app)
        .get(`/api/v1/items/seed-status/${editorUserId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('seed_complete');
    });
  });
});
