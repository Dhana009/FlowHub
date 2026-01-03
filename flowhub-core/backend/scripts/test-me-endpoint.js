/**
 * Quick test script for GET /api/v1/auth/me endpoint
 * 
 * Usage: node scripts/test-me-endpoint.js
 */

// Load environment variables first
require('dotenv').config();

// Set default JWT secrets if not set (for testing only)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
}

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');
const { generateJWT } = require('../src/services/tokenService');

async function testMeEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub');
    console.log('✅ Connected to MongoDB');

    // Create a test user
    const testEmail = `test-me-${Date.now()}@example.com`;
    const passwordHash = await hashPassword('Test123!@#');
    
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      passwordHash: passwordHash,
      role: 'EDITOR',
      isActive: true
    });
    
    console.log(`✅ Created test user: ${testEmail}`);
    console.log(`   User ID: ${testUser._id}`);

    // Generate JWT token
    const token = generateJWT(testUser._id.toString(), testUser.email, testUser.role);
    console.log('✅ Generated JWT token');

    // Test 1: Call /me endpoint with valid token
    console.log('\n📋 Test 1: GET /api/v1/auth/me with valid token');
    const response1 = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log('✅ Status: 200 OK');
    console.log('✅ Response:', JSON.stringify(response1.body, null, 2));

    // Verify response structure
    if (response1.body.status === 'success' && response1.body.data) {
      console.log('✅ Response structure: Valid');
      console.log(`   User ID: ${response1.body.data._id}`);
      console.log(`   Email: ${response1.body.data.email}`);
      console.log(`   Role: ${response1.body.data.role}`);
    } else {
      console.log('❌ Response structure: Invalid');
      process.exit(1);
    }

    // Test 2: Call /me endpoint without token (should fail)
    console.log('\n📋 Test 2: GET /api/v1/auth/me without token');
    const response2 = await request(app)
      .get('/api/v1/auth/me')
      .expect(401);

    console.log('✅ Status: 401 Unauthorized (as expected)');
    console.log('✅ Error response:', JSON.stringify(response2.body, null, 2));

    // Test 3: Call /me endpoint with invalid token (should fail)
    console.log('\n📋 Test 3: GET /api/v1/auth/me with invalid token');
    const response3 = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-12345')
      .expect(401);

    console.log('✅ Status: 401 Unauthorized (as expected)');
    console.log('✅ Error response:', JSON.stringify(response3.body, null, 2));

    // Cleanup
    await User.deleteOne({ _id: testUser._id });
    console.log('\n✅ Cleanup: Test user deleted');

    console.log('\n🎉 All tests passed! /me endpoint is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
}

testMeEndpoint();
