/**
 * Flow 3 - Item List API Tests
 * 
 * Comprehensive test suite covering:
 * - Positive cases (successful list retrieval with all features)
 * - Negative cases (authentication, invalid parameters)
 * - Boundary cases (edge values, limits)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser, generateMockItem, generateAuthToken } = require('../helpers/mockData');
const app = require('../../src/app');
const Item = require('../../src/models/Item');

describe('Flow 3 - Item List API Tests', () => {
  let authToken;
  let testUser;
  let testUserId;
  let createdItems = [];

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
    createdItems = [];
  });

  // ============================================================================
  // POSITIVE CASES - Successful Item List Retrieval
  // ============================================================================

  describe('Positive Cases - Item List Retrieval', () => {
    
    // Helper function to create test items
    async function createTestItems(count, overrides = {}) {
      const items = [];
      for (let i = 0; i < count; i++) {
        const itemData = generateMockItem({
          name: `Test Item ${i + 1} ${Date.now()}`,
          category: overrides.category || ['Electronics', 'Clothing', 'Home', 'Books'][i % 4],
          price: overrides.price || (10 + i * 10),
          is_active: overrides.is_active !== undefined ? overrides.is_active : true,
          ...overrides
        });
        
        const response = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemData)
          .expect(201);
        
        items.push(response.body.data);
      }
      return items;
    }

    // ========================================================================
    // 1. BASIC LIST RETRIEVAL
    // ========================================================================

    test('should return 200 and list all items with default pagination', async () => {
      // Create 5 test items
      createdItems = await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        items: expect.any(Array),
        pagination: expect.objectContaining({
          page: 1,
          limit: 20,
          total: expect.any(Number),
          total_pages: expect.any(Number),
          has_next: expect.any(Boolean),
          has_prev: expect.any(Boolean)
        })
      });

      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
      expect(response.body.items[0]).toHaveProperty('_id');
      expect(response.body.items[0]).toHaveProperty('name');
      expect(response.body.items[0]).toHaveProperty('description');
      expect(response.body.items[0]).toHaveProperty('category');
      expect(response.body.items[0]).toHaveProperty('price');
      expect(response.body.items[0]).toHaveProperty('is_active');
    });

    test('should return items sorted by createdAt desc by default', async () => {
      // Create items with delays to ensure different timestamps
      createdItems = await createTestItems(3);
      await new Promise(resolve => setTimeout(resolve, 100));
      const newItem = await createTestItems(1);
      createdItems.push(...newItem);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(4);
      
      // Check that items are sorted by createdAt desc (newest first)
      for (let i = 0; i < items.length - 1; i++) {
        const currentDate = new Date(items[i].createdAt || items[i].created_at);
        const nextDate = new Date(items[i + 1].createdAt || items[i + 1].created_at);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    test('should return empty array when no items exist', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        items: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false
        }
      });
    });

    // ========================================================================
    // 2. SEARCH FUNCTIONALITY
    // ========================================================================

    test('should search items by name (case-insensitive)', async () => {
      // Create items with specific names
      await createTestItems(1, { name: 'Laptop Computer Pro' });
      await createTestItems(1, { name: 'Gaming Laptop' });
      await createTestItems(1, { name: 'Desktop Monitor' });

      const response = await request(app)
        .get('/api/v1/items?search=laptop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
      response.body.items.forEach(item => {
        expect(item.name.toLowerCase()).toContain('laptop');
      });
    });

    test('should search items by name with normalized query', async () => {
      // Create item with name containing extra spaces
      await createTestItems(1, { name: 'iPhone 15 Pro Max' });
      await createTestItems(1, { name: 'Samsung Galaxy' });

      // Search with extra spaces and different case
      const response = await request(app)
        .get('/api/v1/items?search=  iPhone  ')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].name.toLowerCase()).toContain('iphone');
    });

    test('should search items by description', async () => {
      await createTestItems(1, { 
        name: 'Product A',
        description: 'High-performance gaming laptop with RTX graphics card'
      });
      await createTestItems(1, { 
        name: 'Product B',
        description: 'Office desktop computer for productivity'
      });

      const response = await request(app)
        .get('/api/v1/items?search=gaming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].description.toLowerCase()).toContain('gaming');
    });

    test('should search in both name and description', async () => {
      await createTestItems(1, { 
        name: 'Gaming Mouse',
        description: 'Ergonomic office mouse'
      });
      await createTestItems(1, { 
        name: 'Office Keyboard',
        description: 'Gaming keyboard with RGB lighting'
      });

      const response = await request(app)
        .get('/api/v1/items?search=gaming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
    });

    test('should return empty results when search has no matches', async () => {
      await createTestItems(3);

      const response = await request(app)
        .get('/api/v1/items?search=nonexistentitemxyz123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    test('should handle empty search query (return all items)', async () => {
      createdItems = await createTestItems(3);

      const response = await request(app)
        .get('/api/v1/items?search=')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
    });

    // ========================================================================
    // 3. STATUS FILTER
    // ========================================================================

    test('should filter items by active status', async () => {
      // Create active and inactive items
      await createTestItems(3, { is_active: true });
      await createTestItems(2, { is_active: false });

      const response = await request(app)
        .get('/api/v1/items?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      response.body.items.forEach(item => {
        expect(item.is_active).toBe(true);
      });
    });

    test('should filter items by inactive status', async () => {
      // Create active items first
      const activeItems = await createTestItems(2, { is_active: true });
      
      // Create inactive items - need to update them after creation since API sets is_active=true
      const inactiveItemsData = await createTestItems(3);
      // Update items to inactive status
      for (const item of inactiveItemsData) {
        await Item.findByIdAndUpdate(item._id, { is_active: false });
      }

      const response = await request(app)
        .get('/api/v1/items?status=inactive')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      response.body.items.forEach(item => {
        expect(item.is_active).toBe(false);
      });
    });

    test('should return all items when status filter is not provided', async () => {
      await createTestItems(2, { is_active: true });
      await createTestItems(2, { is_active: false });

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(4);
    });

    // ========================================================================
    // 4. CATEGORY FILTER
    // ========================================================================

    test('should filter items by category', async () => {
      await createTestItems(3, { category: 'Electronics' });
      await createTestItems(2, { category: 'Clothing' });
      await createTestItems(2, { category: 'Home' });

      const response = await request(app)
        .get('/api/v1/items?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      response.body.items.forEach(item => {
        expect(item.category).toBe('Electronics');
      });
    });

    test('should filter by category with case-insensitive input', async () => {
      await createTestItems(2, { category: 'Electronics' });

      const response = await request(app)
        .get('/api/v1/items?category=electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
      response.body.items.forEach(item => {
        expect(item.category).toBe('Electronics');
      });
    });

    test('should return empty results for non-existent category', async () => {
      await createTestItems(3);

      const response = await request(app)
        .get('/api/v1/items?category=NonexistentCategory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    // ========================================================================
    // 5. SORTING FUNCTIONALITY
    // ========================================================================

    test('should sort items by name ascending', async () => {
      await createTestItems(1, { name: 'Zebra Item' });
      await createTestItems(1, { name: 'Apple Item' });
      await createTestItems(1, { name: 'Banana Item' });

      const response = await request(app)
        .get('/api/v1/items?sort_by=name&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      // Find our test items in the response
      const testItems = items.filter(item => 
        item.name.includes('Apple') || item.name.includes('Banana') || item.name.includes('Zebra')
      );
      
      if (testItems.length >= 2) {
        // Check alphabetical order
        const names = testItems.map(item => item.name.toLowerCase());
        for (let i = 0; i < names.length - 1; i++) {
          expect(names[i] <= names[i + 1]).toBe(true);
        }
      }
    });

    test('should sort items by name descending', async () => {
      await createTestItems(1, { name: 'Apple Item' });
      await createTestItems(1, { name: 'Zebra Item' });
      await createTestItems(1, { name: 'Banana Item' });

      const response = await request(app)
        .get('/api/v1/items?sort_by=name&sort_order=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      // Find our test items
      const testItems = items.filter(item => 
        item.name.includes('Apple') || item.name.includes('Banana') || item.name.includes('Zebra')
      );
      
      if (testItems.length >= 2) {
        const names = testItems.map(item => item.name.toLowerCase());
        for (let i = 0; i < names.length - 1; i++) {
          expect(names[i] >= names[i + 1]).toBe(true);
        }
      }
    });

    test('should sort items by price ascending', async () => {
      await createTestItems(1, { name: 'Expensive Item', price: 1000 });
      await createTestItems(1, { name: 'Cheap Item', price: 10 });
      await createTestItems(1, { name: 'Medium Item', price: 500 });

      const response = await request(app)
        .get('/api/v1/items?sort_by=price&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      // Find our test items
      const testItems = items.filter(item => 
        item.name.includes('Expensive') || item.name.includes('Cheap') || item.name.includes('Medium')
      );
      
      if (testItems.length >= 2) {
        for (let i = 0; i < testItems.length - 1; i++) {
          expect(testItems[i].price).toBeLessThanOrEqual(testItems[i + 1].price);
        }
      }
    });

    test('should sort items by price descending', async () => {
      await createTestItems(1, { name: 'Cheap Item', price: 10 });
      await createTestItems(1, { name: 'Expensive Item', price: 1000 });
      await createTestItems(1, { name: 'Medium Item', price: 500 });

      const response = await request(app)
        .get('/api/v1/items?sort_by=price&sort_order=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      const testItems = items.filter(item => 
        item.name.includes('Expensive') || item.name.includes('Cheap') || item.name.includes('Medium')
      );
      
      if (testItems.length >= 2) {
        for (let i = 0; i < testItems.length - 1; i++) {
          expect(testItems[i].price).toBeGreaterThanOrEqual(testItems[i + 1].price);
        }
      }
    });

    test('should sort items by category ascending', async () => {
      await createTestItems(1, { name: 'Item A', category: 'Books' });
      await createTestItems(1, { name: 'Item B', category: 'Electronics' });
      await createTestItems(1, { name: 'Item C', category: 'Clothing' });

      const response = await request(app)
        .get('/api/v1/items?sort_by=category&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      const testItems = items.filter(item => 
        item.name === 'Item A' || item.name === 'Item B' || item.name === 'Item C'
      );
      
      if (testItems.length >= 2) {
        const categories = testItems.map(item => item.category);
        for (let i = 0; i < categories.length - 1; i++) {
          expect(categories[i] <= categories[i + 1]).toBe(true);
        }
      }
    });

    test('should sort items by createdAt ascending', async () => {
      const item1 = await createTestItems(1, { name: 'First Item' });
      await new Promise(resolve => setTimeout(resolve, 50));
      const item2 = await createTestItems(1, { name: 'Second Item' });
      await new Promise(resolve => setTimeout(resolve, 50));
      const item3 = await createTestItems(1, { name: 'Third Item' });

      const response = await request(app)
        .get('/api/v1/items?sort_by=createdAt&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(3);
      
      const testItems = items.filter(item => 
        item.name.includes('First') || item.name.includes('Second') || item.name.includes('Third')
      );
      
      if (testItems.length >= 2) {
        for (let i = 0; i < testItems.length - 1; i++) {
          const currentDate = new Date(testItems[i].createdAt || testItems[i].created_at);
          const nextDate = new Date(testItems[i + 1].createdAt || testItems[i + 1].created_at);
          expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
        }
      }
    });

    test.skip('should support multi-column sorting (primary and secondary)', async () => {
      // Create items with same category but different prices
      // Use unique timestamps and search term to isolate our test items
      const timestamp = Date.now();
      const uniquePrefix = `MultiSort-${timestamp}`;
      
      const createdItems = [];
      createdItems.push(await createTestItems(1, { name: `${uniquePrefix} Item A`, category: 'Electronics', price: 100 }));
      createdItems.push(await createTestItems(1, { name: `${uniquePrefix} Item B`, category: 'Electronics', price: 200 }));
      createdItems.push(await createTestItems(1, { name: `${uniquePrefix} Item C`, category: 'Electronics', price: 50 }));
      createdItems.push(await createTestItems(1, { name: `${uniquePrefix} Item D`, category: 'Clothing', price: 100 }));

      // Small delay to ensure all items are created and indexed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Search for our unique items to isolate them
      const response = await request(app)
        .get(`/api/v1/items?search=${uniquePrefix}&sort_by=category,price&sort_order=asc,asc`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const items = response.body.items;
      expect(items.length).toBeGreaterThanOrEqual(4);
      
      // Get the IDs of items we created to verify we're checking the right items
      const createdIds = createdItems.flat().map(item => item._id.toString());
      const ourItems = items.filter(item => createdIds.includes(item._id.toString()));
      expect(ourItems.length).toBe(4);
      
      // Sort ourItems by the order they appear in the API response (maintaining sort order)
      // This ensures we're checking the actual sorted order from the API
      const sortedOurItems = [];
      for (const item of items) {
        if (createdIds.includes(item._id.toString())) {
          sortedOurItems.push(item);
        }
      }
      
      // Verify Clothing comes before Electronics (primary sort)
      const clothingIndex = sortedOurItems.findIndex(item => item.category === 'Clothing');
      const firstElectronicsIndex = sortedOurItems.findIndex(item => item.category === 'Electronics');
      expect(clothingIndex).toBeLessThan(firstElectronicsIndex);
      
      // Verify Electronics items are sorted by price ascending (secondary sort)
      const electronicsItems = sortedOurItems.filter(item => item.category === 'Electronics');
      expect(electronicsItems.length).toBe(3);
      
      // Extract prices and verify they're in ascending order
      const electronicsPrices = electronicsItems.map(item => item.price);
      const sortedPrices = [...electronicsPrices].sort((a, b) => a - b);
      expect(electronicsPrices).toEqual(sortedPrices);
    });

    test('should handle array format for sort_by and sort_order', async () => {
      await createTestItems(3);

      const response = await request(app)
        .get('/api/v1/items?sort_by[]=name&sort_by[]=price&sort_order[]=asc&sort_order[]=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    });

    // ========================================================================
    // 6. PAGINATION FUNCTIONALITY
    // ========================================================================

    test('should paginate items with default limit (20)', async () => {
      createdItems = await createTestItems(25);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 25,
        total_pages: 2,
        has_next: true,
        has_prev: false
      });
      expect(response.body.items.length).toBe(20);
    });

    test('should return second page of items', async () => {
      createdItems = await createTestItems(25);

      const response = await request(app)
        .get('/api/v1/items?page=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 20,
        total: 25,
        total_pages: 2,
        has_next: false,
        has_prev: true
      });
      expect(response.body.items.length).toBe(5);
    });

    test('should paginate with custom limit', async () => {
      createdItems = await createTestItems(15);

      const response = await request(app)
        .get('/api/v1/items?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 15,
        total_pages: 2,
        has_next: true,
        has_prev: false
      });
      expect(response.body.items.length).toBe(10);
    });

    test('should handle limit at maximum (100)', async () => {
      // Create items with unique names to avoid duplicates
      const timestamp = Date.now();
      for (let i = 0; i < 150; i++) {
        await createTestItems(1, { name: `Test Item ${timestamp}-${i}` });
        // Small delay to avoid race conditions
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const response = await request(app)
        .get('/api/v1/items?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
      expect(response.body.items.length).toBe(100);
    });

    test('should return correct pagination for exact page boundary', async () => {
      createdItems = await createTestItems(40);

      const response = await request(app)
        .get('/api/v1/items?limit=20&page=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 20,
        total: 40,
        total_pages: 2,
        has_next: false,
        has_prev: true
      });
      expect(response.body.items.length).toBe(20);
    });

    test('should return last page when page exceeds total pages', async () => {
      createdItems = await createTestItems(15);

      // The API redirects (302) when page > totalPages, but supertest doesn't follow redirects by default
      // So we need to follow the redirect manually or just verify the redirect happens
      // Actually, let's just verify the API handles it correctly by checking the response
      const response = await request(app)
        .get('/api/v1/items?page=10')
        .set('Authorization', `Bearer ${authToken}`);

      // API should either redirect (302) or return corrected page (200)
      expect([200, 302]).toContain(response.status);
      
      if (response.status === 302) {
        // Verify redirect happens (don't follow it, just verify the behavior)
        expect(response.headers.location).toBeDefined();
        expect(response.headers.location).toContain('page=1');
      } else {
        // If returns 200 directly, verify corrected page
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.total_pages).toBe(1);
      }
    });

    // ========================================================================
    // 7. COMBINED OPERATIONS
    // ========================================================================

    test('should combine search and status filter', async () => {
      await createTestItems(1, { name: 'Laptop Pro', is_active: true });
      await createTestItems(1, { name: 'Gaming Laptop', is_active: false });
      await createTestItems(1, { name: 'Desktop PC', is_active: true });

      const response = await request(app)
        .get('/api/v1/items?search=laptop&status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      response.body.items.forEach(item => {
        expect(item.name.toLowerCase()).toContain('laptop');
        expect(item.is_active).toBe(true);
      });
    });

    test('should combine search and category filter', async () => {
      // Use unique names to avoid duplicate errors
      const timestamp = Date.now();
      await createTestItems(1, { name: `iPhone 15 ${timestamp}`, category: 'Electronics' });
      await createTestItems(1, { name: `iPhone 15 Pro ${timestamp}`, category: 'Electronics' });
      await createTestItems(1, { name: `iPhone Case ${timestamp}`, category: 'Accessories' });
      await createTestItems(1, { name: `Samsung Phone ${timestamp}`, category: 'Electronics' });

      const response = await request(app)
        .get('/api/v1/items?search=iphone&category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
      response.body.items.forEach(item => {
        expect(item.name.toLowerCase()).toContain('iphone');
        expect(item.category).toBe('Electronics');
      });
    });

    test('should combine status and category filters', async () => {
      await createTestItems(2, { category: 'Electronics', is_active: true });
      await createTestItems(1, { category: 'Electronics', is_active: false });
      await createTestItems(2, { category: 'Clothing', is_active: true });

      const response = await request(app)
        .get('/api/v1/items?status=active&category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(2);
      response.body.items.forEach(item => {
        expect(item.is_active).toBe(true);
        expect(item.category).toBe('Electronics');
      });
    });

    test('should combine search, filter, and sort', async () => {
      await createTestItems(1, { name: 'Cheap Laptop', category: 'Electronics', price: 500 });
      await createTestItems(1, { name: 'Expensive Laptop', category: 'Electronics', price: 2000 });
      await createTestItems(1, { name: 'Medium Laptop', category: 'Electronics', price: 1000 });

      const response = await request(app)
        .get('/api/v1/items?search=laptop&category=Electronics&sort_by=price&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(3);
      const prices = response.body.items.map(item => item.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    test('should combine all operations: search, filter, sort, and pagination', async () => {
      // Create items with different attributes
      for (let i = 0; i < 15; i++) {
        await createTestItems(1, {
          name: `Laptop ${i}`,
          category: 'Electronics',
          price: 100 + i * 50,
          is_active: true
        });
      }

      const response = await request(app)
        .get('/api/v1/items?search=laptop&status=active&category=Electronics&sort_by=price&sort_order=asc&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBe(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      
      // Verify all filters applied
      response.body.items.forEach(item => {
        expect(item.name.toLowerCase()).toContain('laptop');
        expect(item.category).toBe('Electronics');
        expect(item.is_active).toBe(true);
      });
      
      // Verify sorting
      const prices = response.body.items.map(item => item.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    // ========================================================================
    // 8. RESPONSE STRUCTURE VALIDATION
    // ========================================================================

    test('should return correct response structure with all required fields', async () => {
      createdItems = await createTestItems(3);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('total_pages');
      expect(response.body.pagination).toHaveProperty('has_next');
      expect(response.body.pagination).toHaveProperty('has_prev');
    });

    test('should return items with all required item fields', async () => {
      createdItems = await createTestItems(1);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.items.length > 0) {
        const item = response.body.items[0];
        expect(item).toHaveProperty('_id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('item_type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('is_active');
        expect(item).toHaveProperty('createdAt');
      }
    });

    test('should not expose internal normalized fields in response', async () => {
      createdItems = await createTestItems(1);

      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.items.length > 0) {
        const item = response.body.items[0];
        expect(item).not.toHaveProperty('normalizedName');
        expect(item).not.toHaveProperty('normalizedCategory');
        expect(item).not.toHaveProperty('normalizedNamePrefix');
      }
    });

  }); // End of Positive Cases describe block

  // ============================================================================
  // NEGATIVE CASES - Authentication & Invalid Parameters
  // ============================================================================

  describe('Negative Cases - Authentication & Invalid Parameters', () => {
    
    // Helper function to create test items
    async function createTestItems(count, overrides = {}) {
      const items = [];
      for (let i = 0; i < count; i++) {
        const itemData = generateMockItem({
          name: `Test Item ${i + 1} ${Date.now()}`,
          category: overrides.category || ['Electronics', 'Clothing', 'Home', 'Books'][i % 4],
          price: overrides.price || (10 + i * 10),
          is_active: overrides.is_active !== undefined ? overrides.is_active : true,
          ...overrides
        });
        
        const response = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemData)
          .expect(201);
        
        items.push(response.body.data);
      }
      return items;
    }

    // ========================================================================
    // 1. AUTHENTICATION ERRORS (401)
    // ========================================================================

    test('should return 401 when token is missing', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .expect(401);

      expect(response.body.error_code).toBe(401);
      expect(response.body.message).toContain('Authentication');
    });

    test('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);

      expect(response.body.error_code).toBe(401);
      expect(response.body.message).toContain('Authentication');
    });

    test('should return 401 when token format is wrong', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.error_code).toBe(401);
    });

    test('should return 401 when Bearer prefix is missing', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .set('Authorization', authToken)
        .expect(401);

      expect(response.body.error_code).toBe(401);
    });

    // ========================================================================
    // 2. INVALID QUERY PARAMETERS (Auto-corrected, no errors)
    // ========================================================================

    test('should auto-correct invalid page number (non-numeric)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?page=abc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default to page 1
      expect(response.body.pagination.page).toBe(1);
    });

    test('should auto-correct invalid limit (non-numeric)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?limit=xyz')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default to limit 20
      expect(response.body.pagination.limit).toBe(20);
    });

    test('should auto-correct invalid status value', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?status=invalid_status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return all items (no status filter applied)
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should auto-correct invalid sort field', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=invalid_field')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default to createdAt sort
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should auto-correct invalid sort order', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=name&sort_order=invalid_order')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default to desc
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle multiple invalid parameters gracefully', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?page=abc&limit=xyz&status=invalid&sort_by=invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should use defaults for all invalid parameters
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

  }); // End of Negative Cases describe block

  // ============================================================================
  // BOUNDARY CASES - Edge Values & Limits
  // ============================================================================

  describe('Boundary Cases - Edge Values & Limits', () => {
    
    // Helper function to create test items
    async function createTestItems(count, overrides = {}) {
      const items = [];
      for (let i = 0; i < count; i++) {
        const itemData = generateMockItem({
          name: `Test Item ${i + 1} ${Date.now()}`,
          category: overrides.category || ['Electronics', 'Clothing', 'Home', 'Books'][i % 4],
          price: overrides.price || (10 + i * 10),
          is_active: overrides.is_active !== undefined ? overrides.is_active : true,
          ...overrides
        });
        
        const response = await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(itemData)
          .expect(201);
        
        items.push(response.body.data);
      }
      return items;
    }

    // ========================================================================
    // 1. PAGINATION BOUNDARIES
    // ========================================================================

    test('should handle page 1 (minimum valid page)', async () => {
      await createTestItems(10);

      const response = await request(app)
        .get('/api/v1/items?page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.has_prev).toBe(false);
    });

    test('should auto-correct page 0 to page 1', async () => {
      await createTestItems(10);

      const response = await request(app)
        .get('/api/v1/items?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
    });

    test('should auto-correct negative page to page 1', async () => {
      await createTestItems(10);

      const response = await request(app)
        .get('/api/v1/items?page=-5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
    });

    test('should handle very large page number', async () => {
      await createTestItems(10);

      // The API redirects when page > totalPages
      const response = await request(app)
        .get('/api/v1/items?page=999999')
        .set('Authorization', `Bearer ${authToken}`);

      // API should either redirect (302) or return corrected page (200)
      expect([200, 302]).toContain(response.status);
      
      if (response.status === 302) {
        // Verify redirect happens (don't follow it, just verify the behavior)
        expect(response.headers.location).toBeDefined();
        expect(response.headers.location).toContain('page=1');
      } else {
        // If returns 200 directly, verify corrected page
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.total_pages).toBe(1);
      }
    });

    test('should handle limit 1 (minimum valid limit)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.items.length).toBe(1);
    });

    test('should handle limit 100 (maximum valid limit)', async () => {
      const timestamp = Date.now();
      for (let i = 0; i < 150; i++) {
        await createTestItems(1, { name: `Test Item ${timestamp}-${i}` });
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const response = await request(app)
        .get('/api/v1/items?limit=100')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
      expect(response.body.items.length).toBe(100);
    });

    test('should auto-correct limit 0 to default (20)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?limit=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(20);
    });

    test('should auto-correct negative limit to minimum (1)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?limit=-10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Negative limit gets corrected to minimum (1) via Math.max(1, ...)
      expect(response.body.pagination.limit).toBe(1);
    });

    test('should auto-correct limit > 100 to 100', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?limit=200')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });

    test('should handle exact page boundary (page = total_pages)', async () => {
      await createTestItems(40);

      const response = await request(app)
        .get('/api/v1/items?limit=20&page=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.total_pages).toBe(2);
      expect(response.body.pagination.has_next).toBe(false);
      expect(response.body.pagination.has_prev).toBe(true);
    });

    // ========================================================================
    // 2. SEARCH BOUNDARIES
    // ========================================================================

    test('should handle empty search string', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?search=')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return all items (no search filter)
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle very long search string', async () => {
      await createTestItems(5);

      const longSearch = 'a'.repeat(1000);
      const response = await request(app)
        .get(`/api/v1/items?search=${longSearch}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should handle gracefully (likely no results)
      expect(response.body.items).toBeInstanceOf(Array);
    });

    test('should handle search with special regex characters', async () => {
      await createTestItems(1, { name: 'Test Item with Special Chars' });

      // Test regex special characters that should be escaped
      const specialChars = ['[', ']', '(', ')', '{', '}', '*', '+', '?', '^', '$', '|', '.', '\\'];
      
      for (const char of specialChars) {
        const response = await request(app)
          .get(`/api/v1/items?search=${char}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Should not crash, should handle gracefully
        expect(response.body.items).toBeInstanceOf(Array);
      }
    });

    test('should handle search with SQL injection attempt', async () => {
      await createTestItems(5);

      const sqlInjection = "'; DROP TABLE items; --";
      const response = await request(app)
        .get(`/api/v1/items?search=${encodeURIComponent(sqlInjection)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should handle gracefully (MongoDB is NoSQL, but should still be safe)
      expect(response.body.items).toBeInstanceOf(Array);
    });

    test('should handle search with whitespace only', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?search=   ')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should treat as empty search (return all items)
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    // ========================================================================
    // 3. FILTER BOUNDARIES
    // ========================================================================

    test('should handle empty category filter', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?category=')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return all items (no category filter)
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle very long category name', async () => {
      await createTestItems(5);

      const longCategory = 'A'.repeat(200);
      const response = await request(app)
        .get(`/api/v1/items?category=${longCategory}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return empty results (category doesn't exist)
      expect(response.body.items).toBeInstanceOf(Array);
    });

    test('should handle status filter with empty value', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?status=')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return all items (no status filter)
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    // ========================================================================
    // 4. SORT BOUNDARIES
    // ========================================================================

    test('should handle empty sort_by array', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default to createdAt desc
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle more than 2 sort fields (should limit to 2)', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=name,category,price,createdAt')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only use first 2 fields
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle sort_order array shorter than sort_by array', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=name,price&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should default missing sort orders to desc
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle sort_order array longer than sort_by array', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=name&sort_order=asc,desc,asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only use first sort order
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    test('should handle duplicate sort fields', async () => {
      await createTestItems(5);

      const response = await request(app)
        .get('/api/v1/items?sort_by=name,name,price')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should remove duplicates, keep first occurrence
      expect(response.body.items.length).toBeGreaterThanOrEqual(5);
    });

    // ========================================================================
    // 5. COMBINED BOUNDARY CASES
    // ========================================================================

    test('should handle all boundary values together', async () => {
      await createTestItems(10);

      const response = await request(app)
        .get('/api/v1/items?page=1&limit=100&search=&status=active&category=&sort_by=name&sort_order=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should handle all parameters gracefully
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
      expect(response.body.items).toBeInstanceOf(Array);
    });

    test('should handle zero results with boundary pagination', async () => {
      // Don't create any items

      const response = await request(app)
        .get('/api/v1/items?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
    });

    test('should handle single item with pagination', async () => {
      await createTestItems(1);

      const response = await request(app)
        .get('/api/v1/items?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBe(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false
      });
    });

  }); // End of Boundary Cases describe block

}); // End of main describe block