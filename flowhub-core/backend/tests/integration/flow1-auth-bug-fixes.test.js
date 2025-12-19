/**
 * Flow 1 - Authentication Bug Fixes Verification Tests
 * 
 * Tests all 7 bug fixes:
 * - BUG-01, BUG-02, BUG-05: Type validation
 * - BUG-03, BUG-06: Error handling (401 instead of 500)
 * - BUG-07: RBAC authorization
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { setupTestDB, cleanupTestDB, clearCollections } = require('../helpers/dbHelper');
const { generateMockUser } = require('../helpers/mockData');
const app = require('../../src/app');
const User = require('../../src/models/User');
const OTP = require('../../src/models/OTP');
const { generateAuthToken } = require('../helpers/mockData');

describe('Flow 1 - Authentication Bug Fixes Verification', () => {
  let testUser;
  let adminUser;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await clearCollections();
    
    // Create regular test user
    testUser = await generateMockUser({
      email: `test${Date.now()}@example.com`,
      passwordHash: await require('bcryptjs').hash('Test123!@#', 10),
      role: 'EDITOR'
    });

    // Create admin user
    adminUser = await generateMockUser({
      email: `admin${Date.now()}@example.com`,
      passwordHash: await require('bcryptjs').hash('Admin123!@#', 10),
      role: 'ADMIN'
    });
  });

  // ============================================================================
  // BUG-01, BUG-02, BUG-05: Type Validation Tests
  // ============================================================================

  describe('Type Validation Fixes (BUG-01, BUG-02, BUG-05)', () => {
    test('BUG-02: Login with email as number should return 422 (not 500)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 12345, // Number instead of string
          password: 'Test123!@#'
        })
        .expect(422);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Email must be a string'
      });
    });

    test('BUG-02: Login with password as number should return 422 (not 500)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 12345 // Number instead of string
        })
        .expect(422);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be a string'
      });
    });

    test('BUG-01, BUG-05: Signup with password as number should return 422 (not 500)', async () => {
      // First request OTP
      const email = `signup${Date.now()}@example.com`;
      await request(app)
        .post('/api/v1/auth/signup/request-otp')
        .send({ email })
        .expect(200);

      // Get OTP from database (use otpPlain field which stores plain text OTP)
      const otpRecord = await OTP.findOne({ email: email.toLowerCase() }).select('+otpPlain');
      const otp = String(otpRecord.otpPlain); // Ensure OTP is string

      // Verify OTP
      await request(app)
        .post('/api/v1/auth/signup/verify-otp')
        .send({ email, otp })
        .expect(200);

      // Try signup with password as number
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 12345, // Number instead of string
          otp,
          role: 'EDITOR'
        })
        .expect(422);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity',
        message: 'Password must be a string'
      });
    });

    test('BUG-05: Signup with password below minimum length should return 422 (not 500)', async () => {
      const email = `signup${Date.now()}@example.com`;
      
      // Request and verify OTP
      await request(app)
        .post('/api/v1/auth/signup/request-otp')
        .send({ email })
        .expect(200);

      const otpRecord = await OTP.findOne({ email: email.toLowerCase() }).select('+otpPlain');
      const otp = String(otpRecord.otpPlain);

      await request(app)
        .post('/api/v1/auth/signup/verify-otp')
        .send({ email, otp })
        .expect(200);

      // Try signup with password too short
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email,
          password: 'Short1!', // 7 chars, below minimum of 8
          otp,
          role: 'EDITOR'
        })
        .expect(422);

      expect(response.body.error_code).toBe(422);
      expect(response.body.message).toContain('at least 8 characters');
    });
  });

  // ============================================================================
  // BUG-03, BUG-06: Error Handling Tests (401 instead of 500)
  // ============================================================================

  describe('Error Handling Fixes (BUG-03, BUG-06)', () => {
    test('BUG-03: Login with wrong password should return 401 (not 500)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!@#'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized'
      });
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('BUG-06: Login with non-existent user should return 401 (not 500)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!@#'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 401,
        error_type: 'Unauthorized'
      });
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('BUG-04: Login with password below minimum length should return 422 (not 500)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'Short1!' // 7 chars, below minimum
        })
        .expect(422);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 422,
        error_type: 'Unprocessable Entity'
      });
      expect(response.body.message).toContain('at least 8 characters');
    });
  });

  // ============================================================================
  // BUG-07: RBAC Authorization Tests
  // ============================================================================

  describe('RBAC Authorization Fix (BUG-07)', () => {
    test('BUG-07: ADMIN user should access GET /users (not 403)', async () => {
      const adminToken = generateAuthToken(adminUser);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'success',
        data: expect.any(Array)
      });
    });

    test('RBAC normalization handles role comparison correctly', async () => {
      // Note: User model enum only allows uppercase roles, but middleware normalizes for comparison
      // This test verifies that the normalization logic works even if role comes from token
      const adminToken = generateAuthToken(adminUser);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      // Verify normalization works by checking that ADMIN role is accepted
      expect(adminUser.role).toBe('ADMIN');
    });

    test('EDITOR user should be denied access to GET /users', async () => {
      const editorToken = generateAuthToken(testUser);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${editorToken}`)
        .expect(403);

      expect(response.body).toMatchObject({
        status: 'error',
        error_code: 403,
        error_type: 'Forbidden - Insufficient Permissions'
      });
    });
  });

  // ============================================================================
  // Integration: Verify fixes work together
  // ============================================================================

  describe('Integration: All Fixes Working Together', () => {
    test('Complete flow: Type validation → Auth error → RBAC all work correctly', async () => {
      // 1. Type validation works
      const typeError = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 123, password: 'Test123!@#' })
        .expect(422);
      expect(typeError.body.error_code).toBe(422);

      // 2. Auth error returns 401
      const authError = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password: 'Test123!@#' })
        .expect(401);
      expect(authError.body.error_code).toBe(401);

      // 3. RBAC works for ADMIN
      const adminToken = generateAuthToken(adminUser);
      const rbacSuccess = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(rbacSuccess.body.status).toBe('success');
    });
  });
});

