/**
 * Simple Item Endpoint Test
 * 
 * Tests item creation with proper multipart/form-data using form-data package
 */

// Check if form-data is installed
let FormData;
try {
  FormData = require('form-data');
} catch (e) {
  console.log('⚠️  form-data package not found.');
  console.log('   Installing form-data...\n');
  const { execSync } = require('child_process');
  try {
    execSync('npm install form-data', { cwd: __dirname + '/..', stdio: 'inherit' });
    FormData = require('form-data');
  } catch (err) {
    console.log('❌ Failed to install form-data');
    process.exit(1);
  }
}

const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
// Use existing user credentials - adjust if needed
const TEST_EMAIL = process.env.TEST_EMAIL || 'ff@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

let authToken = null;

/**
 * Make HTTP request with form data
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

    req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Test Login
 */
async function login() {
  console.log('Step 1: Login');
  try {
    const response = await makeJsonRequest('POST', '/api/v1/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 30)}...\n`);
      return true;
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(`   Error: ${response.data.error || JSON.stringify(response.data)}`);
      console.log(`\n   💡 Please ensure you have a valid user account.`);
      console.log(`   💡 You can create one via the signup flow in the frontend.\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Create Item with multipart/form-data
 */
async function testCreateItem() {
  console.log('Step 2: Create PHYSICAL Item (with multipart/form-data)');
  
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
    const formData = new FormData();
    formData.append('item_data', JSON.stringify(itemData));
    
    // Optionally add a file (if you have one)
    // formData.append('file', fs.createReadStream('path/to/file.jpg'));

    const response = await makeFormRequest(
      'POST',
      '/api/v1/items',
      formData,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 201) {
      console.log('✅ Item created successfully!');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Item ID: ${response.data.item_id}`);
      console.log(`   Item Name: ${response.data.data?.name}`);
      console.log(`   Item Type: ${response.data.data?.item_type}`);
      console.log(`   Category: ${response.data.data?.category}\n`);
      return true;
    } else {
      console.log(`❌ Failed to create item: ${response.status}`);
      console.log(`   Error: ${response.data.error || JSON.stringify(response.data)}`);
      
      // Show more details if available
      if (response.data.validation_errors) {
        console.log(`   Validation Errors:`);
        response.data.validation_errors.forEach(err => {
          console.log(`     - ${err.field}: ${err.message}`);
        });
      }
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Error Cases
 */
async function testErrorCases() {
  console.log('Step 3: Testing Error Cases\n');

  // Test 1: Missing required fields
  console.log('Test 3.1: Missing Required Fields');
  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify({
      name: 'X' // Too short, missing other fields
    }));

    const response = await makeFormRequest(
      'POST',
      '/api/v1/items',
      formData,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status >= 400) {
      console.log(`✅ Properly rejected: ${response.status}`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`❌ Should have failed but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 2: Business rule violation
  console.log('Test 3.2: Business Rule Violation (Electronics must be PHYSICAL)');
  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify({
      name: 'Test Electronics',
      description: 'This should fail - Electronics must be PHYSICAL',
      item_type: 'DIGITAL', // Wrong!
      price: 99.99,
      category: 'Electronics',
      download_url: 'https://example.com/test.zip',
      file_size: 1000000
    }));

    const response = await makeFormRequest(
      'POST',
      '/api/v1/items',
      formData,
      {
        'Authorization': `Bearer ${authToken}`
      }
    );

    if (response.status === 400) {
      console.log(`✅ Business rule violation properly rejected`);
      console.log(`   Error: ${response.data.error}\n`);
    } else {
      console.log(`❌ Should have failed with 400 but got: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Test 3: Unauthorized
  console.log('Test 3.3: Unauthorized Access (No Token)');
  try {
    const formData = new FormData();
    formData.append('item_data', JSON.stringify({
      name: 'Test Item',
      description: 'This should fail - no auth',
      item_type: 'PHYSICAL',
      price: 99.99,
      category: 'Test',
      weight: 1.0,
      dimensions: { length: 10, width: 10, height: 10 }
    }));

    const response = await makeFormRequest(
      'POST',
      '/api/v1/items',
      formData
      // No Authorization header
    );

    if (response.status === 401) {
      console.log(`✅ Unauthorized access properly rejected`);
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
  console.log('🧪 Testing Flow 2 Item Creation Endpoint\n');
  console.log('=' .repeat(60) + '\n');

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    console.log('   Please create a user account first via the frontend signup flow.\n');
    process.exit(1);
  }

  // Step 2: Create item
  await testCreateItem();

  // Step 3: Test error cases
  await testErrorCases();

  console.log('=' .repeat(60));
  console.log('🎉 All endpoint tests completed!\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

