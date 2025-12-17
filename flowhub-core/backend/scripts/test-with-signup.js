/**
 * Endpoint Test Script with Signup
 * 
 * Creates a test user if needed, then tests all endpoints.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@flowhub.com';
const TEST_PASSWORD = 'Test@1234';
const TEST_FIRST_NAME = 'Test';
const TEST_LAST_NAME = 'User';

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
 * Request OTP for signup
 */
async function requestSignupOTP() {
  console.log('Step 1: Request Signup OTP');
  try {
    const response = await makeRequest('POST', '/api/v1/auth/signup/request-otp', {
      email: TEST_EMAIL
    }, {
      'Content-Type': 'application/json'
    });

    if (response.status === 200) {
      console.log('✅ OTP requested successfully\n');
      return true;
    } else {
      console.log(`⚠️  OTP request: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
      // Continue anyway - might already have OTP
      return true;
    }
  } catch (error) {
    console.log(`⚠️  OTP request error: ${error.message}\n`);
    return false;
  }
}

/**
 * Signup with OTP (using a mock OTP - in real scenario, get from email)
 */
async function signup() {
  console.log('Step 2: Signup (Note: Using mock OTP - may fail if OTP system requires real email)');
  try {
    // First verify OTP (this will likely fail without real OTP, but let's try)
    const verifyResponse = await makeRequest('POST', '/api/v1/auth/signup/verify-otp', {
      email: TEST_EMAIL,
      otp: '123456' // Mock OTP
    }, {
      'Content-Type': 'application/json'
    });

    if (verifyResponse.status === 200) {
      console.log('✅ OTP verified');
      
      // Now signup
      const signupResponse = await makeRequest('POST', '/api/v1/auth/signup', {
        firstName: TEST_FIRST_NAME,
        lastName: TEST_LAST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        otp: '123456'
      }, {
        'Content-Type': 'application/json'
      });

      if (signupResponse.status === 201) {
        console.log('✅ User created successfully\n');
        return true;
      } else {
        console.log(`⚠️  Signup response: ${signupResponse.status}`);
        console.log(`   Response: ${JSON.stringify(signupResponse.data)}\n`);
        // User might already exist - that's okay
        return true;
      }
    } else {
      console.log(`⚠️  OTP verification failed: ${verifyResponse.status}`);
      console.log(`   This is expected if OTP system requires real email\n`);
      // Continue - user might already exist
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Signup error: ${error.message}\n`);
    // Continue - user might already exist
    return true;
  }
}

/**
 * Test Login
 */
async function testLogin() {
  console.log('Test 1: Login');
  try {
    const response = await makeRequest('POST', '/api/v1/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      'Content-Type': 'application/json'
    });

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 30)}...\n`);
      return true;
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}\n`);
      
      // Try with the original test credentials
      console.log('   Trying with original test credentials...');
      const response2 = await makeRequest('POST', '/api/v1/auth/login', {
        email: 'ff@gmail.com',
        password: 'Test@1234'
      }, {
        'Content-Type': 'application/json'
      });
      
      if (response2.status === 200 && response2.data.token) {
        authToken = response2.data.token;
        console.log('✅ Login successful with original credentials\n');
        return true;
      }
      
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
    // Note: The endpoint expects multipart/form-data, but for testing we'll send JSON
    // The controller needs to handle both or we need to use proper multipart
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

  // Try to setup user
  await requestSignupOTP();
  await signup();

  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    console.log('   Please ensure you have a valid user account.\n');
    process.exit(1);
  }

  // Test 2: Create item
  await testCreatePhysicalItem();

  console.log('=' .repeat(60));
  console.log('🎉 Basic endpoint tests completed!\n');
  console.log('Note: Full testing requires multipart/form-data for file uploads.\n');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

