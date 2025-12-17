/**
 * Item API Endpoint Test Script
 * 
 * Tests the item creation endpoint with various scenarios.
 * Run with: node scripts/test-item-api.js
 * 
 * Prerequisites:
 * 1. Backend server must be running (npm start)
 * 2. Must have a test user account
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'ff@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

let authToken = null;

/**
 * Login to get authentication token
 */
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 1: Create PHYSICAL item (valid)
 */
async function testCreatePhysicalItem() {
  console.log('Test 1: Create PHYSICAL item (valid)');
  
  const itemData = {
    name: 'Test Laptop',
    description: 'This is a test laptop for testing purposes',
    item_type: 'PHYSICAL',
    price: 1299.99,
    category: 'Electronics',
    tags: ['laptop', 'test'],
    weight: 2.5,
    dimensions: {
      length: 35.5,
      width: 24.0,
      height: 2.0
    }
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    const response = await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('✅ PHYSICAL item created successfully');
    console.log(`   Item ID: ${response.data.item_id}`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Message: ${response.data.message}\n`);
    return response.data.item_id;
  } catch (error) {
    console.log('❌ Failed to create PHYSICAL item');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    return null;
  }
}

/**
 * Test 2: Create DIGITAL item (valid)
 */
async function testCreateDigitalItem() {
  console.log('Test 2: Create DIGITAL item (valid)');
  
  const itemData = {
    name: 'Test Software License',
    description: 'This is a test software license for testing purposes',
    item_type: 'DIGITAL',
    price: 299.99,
    category: 'Software',
    tags: ['software', 'license'],
    download_url: 'https://example.com/download/test-software.zip',
    file_size: 52428800
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    const response = await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('✅ DIGITAL item created successfully');
    console.log(`   Item ID: ${response.data.item_id}\n`);
    return response.data.item_id;
  } catch (error) {
    console.log('❌ Failed to create DIGITAL item');
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    return null;
  }
}

/**
 * Test 3: Create SERVICE item (valid)
 */
async function testCreateServiceItem() {
  console.log('Test 3: Create SERVICE item (valid)');
  
  const itemData = {
    name: 'Test Consulting Service',
    description: 'This is a test consulting service for testing purposes',
    item_type: 'SERVICE',
    price: 150.00,
    category: 'Services',
    tags: ['consulting', 'test'],
    duration_hours: 8
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    const response = await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('✅ SERVICE item created successfully');
    console.log(`   Item ID: ${response.data.item_id}\n`);
    return response.data.item_id;
  } catch (error) {
    console.log('❌ Failed to create SERVICE item');
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    return null;
  }
}

/**
 * Test 4: Invalid item - missing required fields
 */
async function testInvalidItemMissingFields() {
  console.log('Test 4: Invalid item - missing required fields');
  
  const itemData = {
    name: 'X', // Too short
    // Missing description, item_type, price, category
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('❌ Should have failed validation\n');
  } catch (error) {
    console.log('✅ Invalid item properly rejected');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
  }
}

/**
 * Test 5: Business rule violation - wrong category-type combination
 */
async function testBusinessRuleViolation() {
  console.log('Test 5: Business rule violation - Electronics must be PHYSICAL');
  
  const itemData = {
    name: 'Test Electronics Item',
    description: 'This should fail because Electronics must be PHYSICAL',
    item_type: 'DIGITAL', // Wrong - Electronics must be PHYSICAL
    price: 99.99,
    category: 'Electronics',
    download_url: 'https://example.com/download/test.zip',
    file_size: 1000000
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('❌ Should have failed business rule validation\n');
  } catch (error) {
    console.log('✅ Business rule violation properly rejected');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
  }
}

/**
 * Test 6: Unauthorized access (no token)
 */
async function testUnauthorizedAccess() {
  console.log('Test 6: Unauthorized access (no token)');
  
  const itemData = {
    name: 'Test Item',
    description: 'This should fail because no auth token',
    item_type: 'PHYSICAL',
    price: 99.99,
    category: 'Test',
    weight: 1.0,
    dimensions: { length: 10, width: 10, height: 10 }
  };

  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));

    await axios.post(
      `${BASE_URL}/api/v1/items`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
          // No Authorization header
        }
      }
    );

    console.log('❌ Should have failed authentication\n');
  } catch (error) {
    console.log('✅ Unauthorized access properly rejected');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Item API Endpoints...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Run tests
  await testCreatePhysicalItem();
  await testCreateDigitalItem();
  await testCreateServiceItem();
  await testInvalidItemMissingFields();
  await testBusinessRuleViolation();
  await testUnauthorizedAccess();

  console.log('🎉 All API tests completed!\n');
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.log('⚠️  axios not found. Installing...');
  console.log('   Run: npm install axios');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error.message);
  process.exit(1);
});

