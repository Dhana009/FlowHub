/**
 * Flow 2 - Item Creation API Tests
 * 
 * Comprehensive test suite covering:
 * - Positive cases (successful item creation)
 * - Negative cases (all error scenarios)
 * - Boundary cases (edge values)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser, generateMockItem, generateAuthToken, createMockFile, createLargeFile, createInvalidFile } = require('../helpers/mockData');
const app = require('../../src/app');
const Item = require('../../src/models/Item');

describe('Flow 2 - Item Creation API Tests', () => {
  let authToken;
  let testUser;
  let testUserId;

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
  });

  // ============================================================================
  // POSITIVE CASES - Successful Item Creation
  // ============================================================================

  describe('Positive Cases - Successful Item Creation', () => {
    test('should create PHYSICAL item successfully without file', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        name: 'Samsung Galaxy S21',
        description: 'Latest Samsung smartphone with advanced features',
        category: 'Electronics',
        price: 999.99,
        weight: 0.2,
        length: 15,
        width: 8,
        height: 1
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'Item created successfully',
        data: expect.objectContaining({
          name: 'Samsung Galaxy S21',
          item_type: 'PHYSICAL',
          category: 'Electronics',
          price: 999.99
        })
      });

      // Verify in database
      const item = await Item.findById(response.body.data._id);
      expect(item).toBeTruthy();
      expect(item.created_by.toString()).toBe(testUserId);
      expect(item.is_active).toBe(true);
    });

    test('should create DIGITAL item successfully', async () => {
      const itemData = generateMockItem({
        item_type: 'DIGITAL',
        name: 'Adobe Photoshop License',
        description: 'Professional photo editing software license key',
        category: 'Software',
        price: 299.99,
        file_size: 2048000,
        download_url: 'https://example.com/download/photoshop'
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.item_type).toBe('DIGITAL');
      expect(response.body.data.download_url).toBe('https://example.com/download/photoshop');
    });

    test('should create SERVICE item successfully', async () => {
      const itemData = generateMockItem({
        item_type: 'SERVICE',
        name: 'Web Development Consultation',
        description: 'Professional web development consultation service',
        category: 'Services',
        price: 150.00,
        duration_hours: 2
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.item_type).toBe('SERVICE');
      expect(response.body.data.duration_hours).toBe(2);
    });

    test('should create item with file upload', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        name: 'Laptop with Image',
        description: 'Laptop computer with product image attached',
        category: 'Electronics',
        price: 1299.99,
        weight: 2.5,
        length: 35,
        width: 25,
        height: 2
      });

      const file = createMockFile({ size: 2 * 1024 * 1024 }); // 2MB

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', itemData.name)
        .field('description', itemData.description)
        .field('item_type', itemData.item_type)
        .field('category', itemData.category)
        .field('price', itemData.price)
        .field('weight', itemData.weight)
        .field('length', itemData.length)
        .field('width', itemData.width)
        .field('height', itemData.height)
        .attach('file', file.buffer, 'test-image.jpg')
        .expect(201);

      expect(response.body.data).toHaveProperty('file_path');
    });

    test('should create item with tags', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        name: 'Item with Tags',
        description: 'Item that includes multiple tags for categorization',
        category: 'Electronics',
        price: 199.99,
        weight: 1.0,
        length: 20,
        width: 15,
        height: 5,
        tags: ['electronics', 'gadget', 'tech']
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.tags).toEqual(['electronics', 'gadget', 'tech']);
    });
  });

  // ============================================================================
  // NEGATIVE CASES - Authentication (401)
  // ============================================================================

  describe('Negative Cases - Authentication (401)', () => {
    test('should return 401 when token is missing', async () => {
      const itemData = generateMockItem();

      const response = await request(app)
        .post('/api/v1/items')
        .send(itemData)
        .expect(401);

      expect(response.body.error_code).toBe(401);
      expect(response.body.message).toContain('Authentication');
    });

    test('should return 401 when token is invalid', async () => {
      const itemData = generateMockItem();

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', 'Bearer invalid-token-12345')
        .send(itemData)
        .expect(401);

      expect(response.body.error_code).toBe(401);
    });

    test('should return 401 when token format is wrong', async () => {
      const itemData = generateMockItem();

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', 'InvalidFormat token')
        .send(itemData)
        .expect(401);
    });
  });

  // ============================================================================
  // NEGATIVE CASES - Schema Validation (422)
  // ============================================================================

  describe('Negative Cases - Schema Validation (422)', () => {
    test('should return 422 when name is missing', async () => {
      const itemData = generateMockItem();
      delete itemData.name;

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);

      expect(response.body.error_code).toBe(422);
      expect(response.body.message).toContain('Name');
    });

    test('should return 422 when name is too short (<3 chars)', async () => {
      const itemData = generateMockItem({ name: 'AB' });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);

      expect(response.body.error_code).toBe(422);
    });

    test('should return 422 when name is too long (>100 chars)', async () => {
      const itemData = generateMockItem({ name: 'A'.repeat(101) });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when name has invalid characters', async () => {
      const itemData = generateMockItem({ name: 'Item@#$%' });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when description is missing', async () => {
      const itemData = generateMockItem();
      delete itemData.description;

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when description is too short (<10 chars)', async () => {
      const itemData = generateMockItem({ description: 'Short' });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when description is too long (>500 chars)', async () => {
      const itemData = generateMockItem({ description: 'A'.repeat(501) });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when item_type is missing', async () => {
      const itemData = generateMockItem();
      delete itemData.item_type;

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when item_type is invalid', async () => {
      const itemData = generateMockItem({ item_type: 'INVALID' });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when price is missing', async () => {
      const itemData = generateMockItem();
      delete itemData.price;

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when price is too low (<0.01)', async () => {
      const itemData = generateMockItem({ price: 0.001 });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when price is too high (>999999.99)', async () => {
      const itemData = generateMockItem({ price: 1000000 });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when price has too many decimals', async () => {
      const itemData = generateMockItem({ price: 99.999 });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when category is missing', async () => {
      const itemData = generateMockItem();
      delete itemData.category;

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when category is too long (>50 chars)', async () => {
      const itemData = generateMockItem({ category: 'A'.repeat(51) });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when PHYSICAL item missing weight', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: undefined
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when PHYSICAL item missing dimensions', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        length: undefined,
        width: undefined,
        height: undefined
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when DIGITAL item missing download_url', async () => {
      const itemData = generateMockItem({
        item_type: 'DIGITAL',
        category: 'Software', // Use category that matches DIGITAL
        download_url: undefined
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when DIGITAL item missing file_size', async () => {
      const itemData = generateMockItem({
        item_type: 'DIGITAL',
        file_size: undefined
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when SERVICE item missing duration_hours', async () => {
      const itemData = generateMockItem({
        item_type: 'SERVICE',
        duration_hours: undefined
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when tags array has more than 10 items', async () => {
      const itemData = generateMockItem({
        tags: Array(11).fill('tag')
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when tags have duplicates (case-insensitive)', async () => {
      const itemData = generateMockItem({
        tags: ['electronics', 'ELECTRONICS', 'gadget']
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });

    test('should return 422 when tag is too long (>30 chars)', async () => {
      const itemData = generateMockItem({
        tags: ['A'.repeat(31)]
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(422);
    });
  });

  // ============================================================================
  // NEGATIVE CASES - File Validation (413/415)
  // ============================================================================

  describe('Negative Cases - File Validation (413/415)', () => {
    test('should return 413 when file is too large (>5MB)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const largeFile = createLargeFile(); // 6MB

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', itemData.name)
        .field('description', itemData.description)
        .field('item_type', itemData.item_type)
        .field('category', itemData.category)
        .field('price', itemData.price)
        .field('weight', itemData.weight)
        .field('length', itemData.length)
        .field('width', itemData.width)
        .field('height', itemData.height)
        .attach('file', largeFile.buffer, 'large-file.jpg')
        .expect(413);

      expect(response.body.error_code).toBe(413);
    });

    test('should return 415 when file type is invalid', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const invalidFile = createInvalidFile(); // .exe file

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', itemData.name)
        .field('description', itemData.description)
        .field('item_type', itemData.item_type)
        .field('category', itemData.category)
        .field('price', itemData.price)
        .field('weight', itemData.weight)
        .field('length', itemData.length)
        .field('width', itemData.width)
        .field('height', itemData.height)
        .attach('file', invalidFile.buffer, 'test.exe')
        .expect(415);

      expect(response.body.error_code).toBe(415);
    });
  });

  // ============================================================================
  // NEGATIVE CASES - Business Rules (400)
  // ============================================================================

  describe('Negative Cases - Business Rules (400)', () => {
    test('should return 400 when category-type mismatch (Electronics must be PHYSICAL)', async () => {
      const itemData = generateMockItem({
        item_type: 'DIGITAL',
        category: 'Electronics',
        file_size: 1024,
        download_url: 'https://example.com/download'
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);

      expect(response.body.error_code).toBe(400);
      expect(response.body.message).toContain('Electronics');
    });

    test('should return 400 when category-type mismatch (Software must be DIGITAL)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Software',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when category-type mismatch (Services must be SERVICE)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Services',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when Electronics price is too low (<$10)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Electronics',
        price: 9.99,
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when Electronics price is too high (>$50k)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Electronics',
        price: 50001.00,
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when Books price is too low (<$5)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Books',
        price: 4.99,
        weight: 0.5,
        length: 20,
        width: 15,
        height: 2
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when Services price is too low (<$25)', async () => {
      const itemData = generateMockItem({
        item_type: 'SERVICE',
        category: 'Services',
        price: 24.99,
        duration_hours: 1
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when weight is <= 0', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when dimensions are <= 0', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 0,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when file_size is <= 0', async () => {
      const itemData = generateMockItem({
        item_type: 'DIGITAL',
        category: 'Software',
        file_size: 0,
        download_url: 'https://example.com/download'
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });

    test('should return 400 when duration_hours is <= 0', async () => {
      const itemData = generateMockItem({
        item_type: 'SERVICE',
        category: 'Services',
        duration_hours: 0
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(400);
    });
  });

  // ============================================================================
  // NEGATIVE CASES - Duplicate Detection (409)
  // ============================================================================

  describe('Negative Cases - Duplicate Detection (409)', () => {
    test('should return 409 when duplicate item exists (same name + category)', async () => {
      // Create first item
      const itemData1 = generateMockItem({
        name: 'Samsung Galaxy S21',
        category: 'Electronics',
        item_type: 'PHYSICAL',
        weight: 0.2,
        length: 15,
        width: 8,
        height: 1
      });

      await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData1)
        .expect(201);

      // Try to create duplicate
      const itemData2 = generateMockItem({
        name: 'Samsung Galaxy S21', // Same name
        category: 'Electronics', // Same category
        item_type: 'PHYSICAL',
        price: 899.99, // Different price (should still be duplicate)
        weight: 0.2,
        length: 15,
        width: 8,
        height: 1
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData2)
        .expect(409);

      expect(response.body.error_code).toBe('CONFLICT_ERROR');
      expect(response.body.message).toContain('already exists');
    });

    test('should allow same name in different category', async () => {
      // Create item in Electronics
      const itemData1 = generateMockItem({
        name: 'TV Stand',
        category: 'Electronics',
        item_type: 'PHYSICAL',
        weight: 5.0,
        length: 50,
        width: 30,
        height: 10
      });

      await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData1)
        .expect(201);

      // Create same name in Furniture (should be allowed)
      const itemData2 = generateMockItem({
        name: 'TV Stand',
        category: 'Furniture',
        item_type: 'PHYSICAL',
        weight: 10.0,
        length: 60,
        width: 40,
        height: 20
      });

      await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData2)
        .expect(201);
    });

    test('should handle case-insensitive duplicate detection', async () => {
      // Create item
      const itemData1 = generateMockItem({
        name: 'iPhone 13',
        category: 'Electronics',
        item_type: 'PHYSICAL',
        weight: 0.2,
        length: 15,
        width: 8,
        height: 1
      });

      await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData1)
        .expect(201);

      // Try duplicate with different case
      const itemData2 = generateMockItem({
        name: 'IPHONE 13', // Different case
        category: 'electronics', // Different case
        item_type: 'PHYSICAL',
        weight: 0.2,
        length: 15,
        width: 8,
        height: 1
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData2)
        .expect(409);
    });
  });

  // ============================================================================
  // BOUNDARY CASES - Edge Values
  // ============================================================================

  describe('Boundary Cases - Edge Values', () => {
    test('should accept name with exactly 3 characters', async () => {
      const itemData = generateMockItem({
        name: 'ABC',
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.name).toBe('ABC');
    });

    test('should accept name with exactly 100 characters', async () => {
      const itemData = generateMockItem({
        name: 'A'.repeat(100),
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept description with exactly 10 characters', async () => {
      const itemData = generateMockItem({
        description: '1234567890',
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept description with exactly 500 characters', async () => {
      const itemData = generateMockItem({
        description: 'A'.repeat(500),
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept price with exactly 0.01', async () => {
      const itemData = generateMockItem({
        price: 0.01,
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept price with exactly 999999.99', async () => {
      const itemData = generateMockItem({
        price: 999999.99,
        item_type: 'PHYSICAL',
        category: 'Clothing', // Use category without price restrictions
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept category with exactly 1 character', async () => {
      const itemData = generateMockItem({
        category: 'A',
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept category with exactly 50 characters', async () => {
      const itemData = generateMockItem({
        category: 'A'.repeat(50),
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept exactly 10 tags', async () => {
      const itemData = generateMockItem({
        tags: Array(10).fill(0).map((_, i) => `tag${i}`),
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.tags).toHaveLength(10);
    });

    test('should accept tag with exactly 30 characters', async () => {
      const itemData = generateMockItem({
        tags: ['A'.repeat(30)],
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept file with exactly 5MB', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const file = createMockFile({ size: 5 * 1024 * 1024 }); // Exactly 5MB

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', itemData.name)
        .field('description', itemData.description)
        .field('item_type', itemData.item_type)
        .field('category', itemData.category)
        .field('price', itemData.price)
        .field('weight', itemData.weight)
        .field('length', itemData.length)
        .field('width', itemData.width)
        .field('height', itemData.height)
        .attach('file', file.buffer, 'test-image.jpg')
        .expect(201);
    });

    test('should accept weight with very small value (>0)', async () => {
      const itemData = generateMockItem({
        weight: 0.01,
        item_type: 'PHYSICAL',
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept dimensions with very small values (>0)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        weight: 1.0,
        length: 0.01,
        width: 0.01,
        height: 0.01
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept Electronics price at minimum ($10.00)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Electronics',
        price: 10.00,
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });

    test('should accept Electronics price at maximum ($50,000.00)', async () => {
      const itemData = generateMockItem({
        item_type: 'PHYSICAL',
        category: 'Electronics',
        price: 50000.00,
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10
      });

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);
    });
  });
});

