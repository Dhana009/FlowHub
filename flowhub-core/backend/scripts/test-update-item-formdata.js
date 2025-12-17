/**
 * Test Update Item API with FormData (like frontend)
 * 
 * Tests the PUT /api/v1/items/:id endpoint with FormData
 * to verify version field parsing works correctly.
 * 
 * Run with: node scripts/test-update-item-formdata.js
 * 
 * Prerequisites:
 * 1. Backend server must be running (npm start)
 * 2. Must have a test user account
 */

const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;
const TEST_EMAIL = process.env.TEST_EMAIL || 'ff@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

let authToken = null;
let testItemId = null;
let testItemVersion = null;

/**
 * Login to get authentication token
 */
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
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
 * Create a test item to update
 */
async function createTestItem() {
  try {
    console.log('📦 Creating test item...');
    const formData = new FormData();
    formData.append('name', 'Test Item for Update');
    formData.append('description', 'This is a test item for testing update functionality');
    formData.append('item_type', 'PHYSICAL');
    formData.append('price', '99.99');
    formData.append('category', 'Test');
    formData.append('weight', '1.5');
    formData.append('dimensions[length]', '10');
    formData.append('dimensions[width]', '10');
    formData.append('dimensions[height]', '10');

    const response = await axios.post(`${API_BASE}/items`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    testItemId = response.data.item_id;
    console.log(`✅ Test item created: ${testItemId}\n`);
    
    // Get the item to get its version
    const getResponse = await axios.get(`${API_BASE}/items/${testItemId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    testItemVersion = getResponse.data.data.version || 1;
    console.log(`📌 Item version: ${testItemVersion}\n`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create test item:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 1: Update item with FormData and version as string (like frontend)
 */
async function testUpdateWithFormDataStringVersion() {
  try {
    console.log('🧪 Test 1: Update item with FormData (version as string)...');
    
    const formData = new FormData();
    formData.append('name', 'Updated Item Name');
    formData.append('description', 'Updated description');
    formData.append('price', '149.99');
    formData.append('version', testItemVersion.toString()); // Send as string (like FormData does)

    const response = await axios.put(`${API_BASE}/items/${testItemId}`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      console.log('✅ Update successful!');
      console.log(`   Updated Name: ${response.data.data.name}`);
      console.log(`   New Version: ${response.data.data.version}`);
      console.log(`   Expected Version: ${testItemVersion + 1}`);
      
      if (response.data.data.version === testItemVersion + 1) {
        console.log('✅ Version incremented correctly\n');
        testItemVersion = response.data.data.version; // Update for next test
        return true;
      } else {
        console.log('❌ Version mismatch\n');
        return false;
      }
    } else {
      console.log('❌ Update failed - unexpected response\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Update failed');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log(`   Full Error:`, JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    return false;
  }
}

/**
 * Test 2: Update item with FormData and version as number
 */
async function testUpdateWithFormDataNumberVersion() {
  try {
    console.log('🧪 Test 2: Update item with FormData (version as number)...');
    
    const formData = new FormData();
    formData.append('name', 'Updated Item Name 2');
    formData.append('description', 'Updated description 2');
    formData.append('price', '199.99');
    formData.append('version', testItemVersion); // Send as number

    const response = await axios.put(`${API_BASE}/items/${testItemId}`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.status === 200 && response.data.status === 'success') {
      console.log('✅ Update successful!');
      console.log(`   Updated Name: ${response.data.data.name}`);
      console.log(`   New Version: ${response.data.data.version}\n`);
      return true;
    } else {
      console.log('❌ Update failed - unexpected response\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Update failed');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    return false;
  }
}

/**
 * Test 3: Update item with invalid version (should fail)
 */
async function testUpdateWithInvalidVersion() {
  try {
    console.log('🧪 Test 3: Update item with invalid version (should fail)...');
    
    const formData = new FormData();
    formData.append('name', 'Should Fail');
    formData.append('version', 'invalid'); // Invalid version

    await axios.put(`${API_BASE}/items/${testItemId}`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('❌ Should have failed with invalid version\n');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid version properly rejected');
      console.log(`   Error: ${error.response.data.message}\n`);
      return true;
    } else {
      console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}\n`);
      return false;
    }
  }
}

/**
 * Test 4: Update item without version (should fail)
 */
async function testUpdateWithoutVersion() {
  try {
    console.log('🧪 Test 4: Update item without version (should fail)...');
    
    const formData = new FormData();
    formData.append('name', 'Should Fail');

    await axios.put(`${API_BASE}/items/${testItemId}`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('❌ Should have failed without version\n');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Missing version properly rejected');
      console.log(`   Error: ${error.response.data.message}\n`);
      return true;
    } else {
      console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}\n`);
      return false;
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Update Item API with FormData...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Create test item
  const createSuccess = await createTestItem();
  if (!createSuccess) {
    console.error('❌ Cannot proceed without test item');
    process.exit(1);
  }

  // Run tests
  const results = [];
  results.push(await testUpdateWithFormDataStringVersion());
  results.push(await testUpdateWithFormDataNumberVersion());
  results.push(await testUpdateWithInvalidVersion());
  results.push(await testUpdateWithoutVersion());

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`   Failed: ${results.filter(r => !r).length}/${results.length}\n`);

  if (results.every(r => r)) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

