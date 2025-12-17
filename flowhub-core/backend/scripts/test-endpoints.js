/**
 * Endpoint Test Script
 * 
 * Tests Flow 2 item creation endpoints and verifies Flow 1 auth still works.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'ff@gmail.com';
const TEST_PASSWORD = 'Test@1234';

let authToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }

    req.end();
  });
}

/**
 * Test health endpoint
 */
async function testHealth() {
  console.log('Test 0: Health Check');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      console.log('✅ Server is running\n');
      return true;
    } else {
      console.log(`❌ Health check failed: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server not responding: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Flow 1: Login (Regression Check)
 */
async function testLogin() {
  console.log('Test 1: Flow 1 Login (Regression Check)');
  try {
    const response = await makeRequest('POST', '/api/v1/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      'Content-Type': 'application/json'
    });

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful - Flow 1 still works!');
      console.log(`   Token received: ${authToken.substring(0, 20)}...\n`);
      return true;
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Create PHYSICAL Item
 */
async function testCreatePhysicalItem() {
  console.log('Test 2: Create PHYSICAL Item');
  
  const itemData = {
    name: 'Test Laptop Computer',
    description: 'This is a test laptop for testing the item creation endpoint',
    item_type: 'PHYSICAL',
    price: 1299.99,
    category: 'Electronics',
    tags: ['laptop', 'computer', 'test'],
    weight: 2.5,
    dimensions: {
      length: 35.5,
      width: 24.0,
      height: 2.0
    }
  };

  try {
    // For multipart/form-data, we need to use a different approach
    // Since Node.js http doesn't easily support multipart, let's test with JSON first
    // and note that file upload will need to be tested separately
    
    const response = await makeRequest('POST', '/api/v1/items', 
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 201) {
      console.log('✅ PHYSICAL item created successfully');
      console.log(`   Item ID: ${response.data.item_id}`);
      console.log(`   Status: ${response.data.status}\n`);
      return response.data.item_id;
    } else {
      console.log(`❌ Failed to create PHYSICAL item: ${response.status}`);
      console.log(`   Error: ${response.data.error || JSON.stringify(response.data)}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Create DIGITAL Item
 */
async function testCreateDigitalItem() {
  console.log('Test 3: Create DIGITAL Item');
  
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
    const response = await makeRequest('POST', '/api/v1/items',
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 201) {
      console.log('✅ DIGITAL item created successfully');
      console.log(`   Item ID: ${response.data.item_id}\n`);
      return response.data.item_id;
    } else {
      console.log(`❌ Failed: ${response.status}`);
      console.log(`   Error: ${response.data.error || JSON.stringify(response.data)}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Create SERVICE Item
 */
async function testCreateServiceItem() {
  console.log('Test 4: Create SERVICE Item');
  
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
    const response = await makeRequest('POST', '/api/v1/items',
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 201) {
      console.log('✅ SERVICE item created successfully');
      console.log(`   Item ID: ${response.data.item_id}\n`);
      return response.data.item_id;
    } else {
      console.log(`❌ Failed: ${response.status}`);
      console.log(`   Error: ${response.data.error || JSON.stringify(response.data)}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Invalid Item - Missing Required Fields
 */
async function testInvalidItem() {
  console.log('Test 5: Invalid Item - Missing Required Fields');
  
  const itemData = {
    name: 'X', // Too short
    // Missing description, item_type, price, category
  };

  try {
    const response = await makeRequest('POST', '/api/v1/items',
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status >= 400) {
      console.log('✅ Invalid item properly rejected');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`❌ Should have failed but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Test Business Rule Violation
 */
async function testBusinessRuleViolation() {
  console.log('Test 6: Business Rule Violation - Electronics must be PHYSICAL');
  
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
    const response = await makeRequest('POST', '/api/v1/items',
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 400) {
      console.log('✅ Business rule violation properly rejected');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`❌ Should have failed with 400 but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Test Unauthorized Access
 */
async function testUnauthorizedAccess() {
  console.log('Test 7: Unauthorized Access (No Token)');
  
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
    const response = await makeRequest('POST', '/api/v1/items',
      JSON.stringify({ item_data: JSON.stringify(itemData) }),
      {
        'Content-Type': 'application/json'
        // No Authorization header
      }
    );

    if (response.status === 401) {
      console.log('✅ Unauthorized access properly rejected');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`❌ Should have failed with 401 but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Flow 2 Item Creation Endpoints\n');
  console.log('=' .repeat(60) + '\n');

  // Test 0: Health check
  const serverRunning = await testHealth();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('   Run: cd backend && npm run dev\n');
    process.exit(1);
  }

  // Test 1: Flow 1 Login (Regression Check)
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Test 2-4: Create valid items
  await testCreatePhysicalItem();
  await testCreateDigitalItem();
  await testCreateServiceItem();

  // Test 5-7: Error cases
  await testInvalidItem();
  await testBusinessRuleViolation();
  await testUnauthorizedAccess();

  console.log('=' .repeat(60));
  console.log('🎉 All endpoint tests completed!\n');
  console.log('Note: File upload testing requires multipart/form-data');
  console.log('      which is better tested with curl or Postman.\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

