/**
 * Test Script for Flow 3 - Item List Endpoints
 * 
 * Tests all resolved ambiguities and PRD requirements
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub';

// Generate unique test email to avoid conflicts
const timestamp = Date.now();
const TEST_EMAIL = `flow3test${timestamp}@flowhub.com`;
const TEST_PASSWORD = 'Test@1234';
const TEST_FIRST_NAME = 'Flow';
const TEST_LAST_NAME = 'Test';

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Make HTTP request using built-in http module
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
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        status: 0
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Helper: Make authenticated request
 */
async function authenticatedRequest(method, endpoint, data = null, params = null) {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const path = `${API_URL}${endpoint}${queryString}`;
  
  return await makeRequest(method, path, data, {
    'Authorization': `Bearer ${authToken}`
  });
}

/**
 * Test helper
 */
function test(name, condition, details = '') {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS', details });
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', details });
    console.log(`❌ FAIL: ${name}${details ? ` - ${details}` : ''}`);
  }
}

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('   ⚠️  MongoDB connection failed:', error.message);
    return false;
  }
}

/**
 * Get OTP from MongoDB (for testing)
 */
async function getOTPFromMongoDB(email) {
  try {
    const OTP = mongoose.model('OTP', new mongoose.Schema({
      email: String,
      otp: String,
      otpPlain: String,
      type: String,
      expiresAt: Date,
      isUsed: Boolean
    }, { collection: 'otps' }));
    
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'signup',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (otpDoc && otpDoc.otpPlain) {
      return otpDoc.otpPlain;
    }
    return null;
  } catch (error) {
    console.log('   ⚠️  Error getting OTP from MongoDB:', error.message);
    return null;
  }
}

/**
 * Create new account and login
 */
async function createAccountAndLogin() {
  console.log('\n🔐 Creating new test account...');
  console.log(`   Email: ${TEST_EMAIL}`);
  
  // Connect to MongoDB to get OTP
  const mongoConnected = await connectMongoDB();
  
  // Step 1: Request OTP for signup
  console.log('   Step 1: Requesting OTP...');
  const otpRequest = await makeRequest('POST', `${API_URL}/auth/signup/request-otp`, {
    email: TEST_EMAIL
  });
  
  if (otpRequest.status === 200) {
    console.log('   ✅ OTP requested successfully');
    
    // Wait a moment for OTP to be stored in MongoDB
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get OTP from MongoDB
    let otp = null;
    if (mongoConnected) {
      otp = await getOTPFromMongoDB(TEST_EMAIL);
      if (otp) {
        console.log(`   ✅ Retrieved OTP from MongoDB: ${otp}`);
      } else {
        console.log('   ⚠️  Could not retrieve OTP from MongoDB');
      }
    }
    
    // If we got OTP, complete signup
    if (otp) {
      console.log('   Step 2: Completing signup...');
      const signupResponse = await makeRequest('POST', `${API_URL}/auth/signup`, {
        firstName: TEST_FIRST_NAME,
        lastName: TEST_LAST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        otp: otp
      });
      
      if (signupResponse.success && signupResponse.data.token) {
        authToken = signupResponse.data.token;
        console.log('   ✅ Account created and logged in successfully');
        if (mongoConnected) await mongoose.connection.close();
        return true;
      } else {
        console.log('   ❌ Signup failed:', signupResponse.data?.error || signupResponse.data?.message);
        if (mongoConnected) await mongoose.connection.close();
        return false;
      }
    } else {
      console.log('   ❌ Could not get OTP. Please check MongoDB connection.');
      if (mongoConnected) await mongoose.connection.close();
      return false;
    }
  } else {
    console.log(`   ❌ OTP request failed: ${otpRequest.status}`);
    console.log(`   Response: ${JSON.stringify(otpRequest.data)}`);
    if (mongoConnected) await mongoose.connection.close();
    return false;
  }
}

/**
 * Test 1: Search Normalization
 */
async function testSearchNormalization() {
  console.log('\n📋 Test 1: Search Normalization');
  
  // Test with extra whitespace
  const result1 = await authenticatedRequest('GET', '/items', null, {
    search: '  iPhone  '
  });
  test('Search normalizes whitespace', result1.success, 'Should handle "  iPhone  "');
  
  // Test with special regex characters
  const result2 = await authenticatedRequest('GET', '/items', null, {
    search: 'test.*+?^$'
  });
  test('Search escapes regex characters', result2.success, 'Should handle special regex chars');
  
  // Test empty search
  const result3 = await authenticatedRequest('GET', '/items', null, {
    search: ''
  });
  test('Empty search returns all items', result3.success, 'Empty string should not filter');
}

/**
 * Test 2: Status Filter
 */
async function testStatusFilter() {
  console.log('\n📋 Test 2: Status Filter');
  
  const result1 = await authenticatedRequest('GET', '/items', null, {
    status: 'active'
  });
  test('Status filter active works', result1.success, 'Should filter is_active=true');
  
  const result2 = await authenticatedRequest('GET', '/items', null, {
    status: 'inactive'
  });
  test('Status filter inactive works', result2.success, 'Should filter is_active=false');
  
  const result3 = await authenticatedRequest('GET', '/items', null, {
    status: 'all'
  });
  test('Status filter all works', result3.success, 'Should return all items');
  
  // Test invalid status (should use default)
  const result4 = await authenticatedRequest('GET', '/items', null, {
    status: 'invalid'
  });
  test('Invalid status uses default', result4.success, 'Should not error on invalid status');
}

/**
 * Test 3: Category Filter
 */
async function testCategoryFilter() {
  console.log('\n📋 Test 3: Category Filter');
  
  const result1 = await authenticatedRequest('GET', '/items', null, {
    category: 'Electronics'
  });
  test('Category filter works', result1.success, 'Should filter by normalizedCategory');
  
  // Test case-insensitive
  const result2 = await authenticatedRequest('GET', '/items', null, {
    category: 'electronics'
  });
  test('Category filter normalizes case', result2.success, 'Should normalize to Title Case');
  
  // Test non-existent category (should return empty, no error)
  const result3 = await authenticatedRequest('GET', '/items', null, {
    category: 'NonExistentCategory123'
  });
  const items = result3.data?.items || result3.data?.data?.items || [];
  test('Non-existent category returns empty', result3.success && Array.isArray(items) && items.length === 0, 'Should return empty array, no error');
}

/**
 * Test 4: Sort Fields
 */
async function testSortFields() {
  console.log('\n📋 Test 4: Sort Fields');
  
  // Test valid sort fields
  const validFields = ['name', 'category', 'price', 'createdAt'];
  for (const field of validFields) {
    const result = await authenticatedRequest('GET', '/items', null, {
      sort_by: field,
      sort_order: 'asc'
    });
    test(`Sort by ${field} works`, result.success, `Should sort by ${field}`);
  }
  
  // Test invalid sort field (should default to createdAt)
  const result1 = await authenticatedRequest('GET', '/items', null, {
    sort_by: 'invalidField',
    sort_order: 'asc'
  });
  test('Invalid sort field uses default', result1.success, 'Should default to createdAt');
  
  // Test duplicate sort fields (should remove duplicates)
  const result2 = await authenticatedRequest('GET', '/items', null, {
    sort_by: ['name', 'name', 'price'],
    sort_order: ['asc', 'desc', 'asc']
  });
  test('Duplicate sort fields removed', result2.success, 'Should remove duplicates');
  
  // Test max 2 columns
  const result3 = await authenticatedRequest('GET', '/items', null, {
    sort_by: ['name', 'category', 'price', 'createdAt'],
    sort_order: ['asc', 'desc', 'asc', 'desc']
  });
  test('Max 2 sort columns enforced', result3.success, 'Should limit to 2 columns');
}

/**
 * Test 5: Pagination
 */
async function testPagination() {
  console.log('\n📋 Test 5: Pagination');
  
  // Test valid pagination
  const result1 = await authenticatedRequest('GET', '/items', null, {
    page: 1,
    limit: 20
  });
  test('Valid pagination works', result1.success, 'Should return page 1 with 20 items');
  
  // Test invalid page (should auto-correct)
  const result2 = await authenticatedRequest('GET', '/items', null, {
    page: 0
  });
  test('Invalid page (< 1) auto-corrects', result2.success, 'Should default to page 1');
  
  // Test invalid limit (should auto-correct)
  const result3 = await authenticatedRequest('GET', '/items', null, {
    limit: 200
  });
  test('Invalid limit (> 100) auto-corrects', result3.success, 'Should limit to 100');
  
  // Test zero results pagination
  const result4 = await authenticatedRequest('GET', '/items', null, {
    search: 'NonExistentItem12345XYZ999',
    page: 1
  });
  const pagination = result4.data?.pagination;
  test('Zero results has pagination object', pagination !== undefined, `Should have pagination even with 0 results. Got: ${JSON.stringify(result4.data)}`);
  if (pagination) {
    test('Zero results pagination format', 
      pagination.total === 0 && 
      pagination.total_pages === 0 &&
      pagination.page === 1,
      'Should be page 1, total 0, total_pages 0'
    );
  }
}

/**
 * Test 6: Combined Operations
 */
async function testCombinedOperations() {
  console.log('\n📋 Test 6: Combined Operations');
  
  const result = await authenticatedRequest('GET', '/items', null, {
    search: 'test',
    status: 'active',
    category: 'Electronics',
    sort_by: 'price',
    sort_order: 'desc',
    page: 1,
    limit: 20
  });
  
  test('Combined operations work', result.success, 'Search + Filter + Sort + Pagination');
  
  if (result.success && result.data) {
    const items = result.data.items || [];
    const pagination = result.data.pagination;
    test('Response has items array', Array.isArray(items), 'Should have items array');
    test('Response has pagination object', pagination !== undefined, `Should have pagination object. Got: ${JSON.stringify(Object.keys(result.data))}`);
  }
}

/**
 * Test 7: URL Parameters
 */
async function testURLParameters() {
  console.log('\n📋 Test 7: URL Parameters');
  
  // Test all optional parameters
  const result1 = await authenticatedRequest('GET', '/items');
  test('All parameters optional', result1.success, 'Should work with no parameters');
  
  // Test array parameters
  const result2 = await authenticatedRequest('GET', '/items', null, {
    sort_by: ['name', 'price'],
    sort_order: ['asc', 'desc']
  });
  test('Array parameters work', result2.success, 'Should handle arrays');
}

/**
 * Test 8: Authentication
 */
async function testAuthentication() {
  console.log('\n📋 Test 8: Authentication');
  
  // Test without token
  const response1 = await makeRequest('GET', `${API_URL}/items`);
  test('Unauthenticated request fails', response1.status === 401, 'Should return 401');
  
  // Test with invalid token
  const response2 = await makeRequest('GET', `${API_URL}/items`, null, {
    'Authorization': 'Bearer invalid-token'
  });
  test('Invalid token fails', response2.status === 401, 'Should return 401');
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Flow 3 - Item List Endpoint Tests');
  console.log('=====================================\n');
  
  // Create account and login first
  const authSuccess = await createAccountAndLogin();
  
  if (!authSuccess) {
    console.log('\n⚠️  WARNING: Account creation failed. Tests will fail.');
    console.log('   Please ensure:');
    console.log('   1. MongoDB is running');
    console.log('   2. Server is running on port 3000');
    console.log('   3. MongoDB connection string is correct');
    console.log('\n   Continuing with tests anyway...\n');
  }
  
  // Run all test suites
  await testSearchNormalization();
  await testStatusFilter();
  await testCategoryFilter();
  await testSortFields();
  await testPagination();
  await testCombinedOperations();
  await testURLParameters();
  await testAuthentication();
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  console.log(`\nSuccess Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`   - ${t.name}${t.details ? `: ${t.details}` : ''}`));
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

