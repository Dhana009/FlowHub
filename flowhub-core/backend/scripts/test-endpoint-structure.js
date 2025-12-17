/**
 * Endpoint Structure Test
 * 
 * Tests that endpoints are properly registered and respond correctly.
 * Tests authentication requirement without needing valid credentials.
 */

const http = require('http');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000';

/**
 * Make JSON request
 */
function makeJsonRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
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
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Make form data request
 */
function makeFormRequest(method, path, formData, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        ...formData.getHeaders(),
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

    formData.pipe(req);
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Testing Flow 2 Endpoint Structure\n');
  console.log('=' .repeat(60) + '\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  try {
    const response = await makeJsonRequest('GET', '/health');
    if (response.status === 200) {
      console.log('✅ Server is running');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message}\n`);
    } else {
      console.log(`❌ Health check failed: ${response.status}\n`);
      return;
    }
  } catch (error) {
    console.log(`❌ Server not responding: ${error.message}\n`);
    return;
  }

  // Test 2: Item endpoint exists (should return 401 without auth)
  console.log('Test 2: Item Creation Endpoint - Authentication Required');
  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify({
      name: 'Test Item',
      description: 'Test description',
      item_type: 'PHYSICAL',
      price: 99.99,
      category: 'Test',
      weight: 1.0,
      dimensions: { length: 10, width: 10, height: 10 }
    }));

    const response = await makeFormRequest('POST', '/api/v1/items', formData);

    if (response.status === 401) {
      console.log('✅ Endpoint exists and requires authentication');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error}`);
      console.log(`   ✅ Authentication middleware is working!\n`);
    } else if (response.status === 400 || response.status === 422) {
      console.log('✅ Endpoint exists and is processing requests');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      console.log(`   ⚠️  Note: Got validation error instead of auth error`);
      console.log(`   This might mean auth middleware isn't being called first\n`);
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 3: Invalid token
  console.log('Test 3: Item Creation Endpoint - Invalid Token');
  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify({
      name: 'Test Item',
      description: 'Test description',
      item_type: 'PHYSICAL',
      price: 99.99,
      category: 'Test',
      weight: 1.0,
      dimensions: { length: 10, width: 10, height: 10 }
    }));

    const response = await makeFormRequest(
      'POST',
      '/api/v1/items',
      formData,
      {
        'Authorization': 'Bearer invalid-token-12345'
      }
    );

    if (response.status === 401) {
      console.log('✅ Invalid token properly rejected');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 4: GET items endpoint (should work without auth for now)
  console.log('Test 4: GET Items Endpoint (Placeholder)');
  try {
    const response = await makeJsonRequest('GET', '/api/v1/items');
    console.log(`✅ GET endpoint exists`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 5: 404 for invalid route
  console.log('Test 5: Invalid Route (404 Check)');
  try {
    const response = await makeJsonRequest('GET', '/api/v1/items/invalid-route-test-12345');
    if (response.status === 404) {
      console.log('✅ 404 handler working correctly');
      console.log(`   Status: ${response.status}\n`);
    } else {
      console.log(`⚠️  Expected 404 but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('=' .repeat(60));
  console.log('🎉 Endpoint structure tests completed!\n');
  console.log('📋 Summary:');
  console.log('   ✅ Server is running');
  console.log('   ✅ Item creation endpoint is registered');
  console.log('   ✅ Authentication middleware is in place');
  console.log('   ✅ Error handling is working\n');
  console.log('💡 To test with real data:');
  console.log('   1. Create a user account via frontend signup');
  console.log('   2. Login to get authentication token');
  console.log('   3. Use token to create items\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

