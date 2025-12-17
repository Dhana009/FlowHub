/**
 * Create Test Account Script (Auto OTP)
 * 
 * Creates a new test account by automatically retrieving OTP from MongoDB.
 * 
 * Usage: node scripts/create-test-account-auto.js
 * 
 * Prerequisites:
 * - Backend server must be running (npm start)
 * - MongoDB must be accessible
 * - Mongoose connection available
 */

require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub';

// Generate unique test email
const timestamp = Date.now();
const TEST_EMAIL = `test-flow2-${timestamp}@flowhub.test`;
const TEST_PASSWORD = 'Test@1234';
const TEST_FIRST_NAME = 'Flow';
const TEST_LAST_NAME = 'TestUser';

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
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            data: body,
            headers: res.headers
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
 * Get OTP from MongoDB
 */
async function getOTPFromDB(email) {
  try {
    const OTP = require('../src/models/OTP');
    const otpDoc = await OTP.findOne({ 
      email: email.toLowerCase(),
      type: 'signup',
      expiresAt: { $gt: new Date() },
      isUsed: false
    }).sort({ createdAt: -1 });

    if (otpDoc) {
      return otpDoc.otpPlain; // Use otpPlain field from model
    }
    return null;
  } catch (error) {
    console.error('Error fetching OTP from DB:', error.message);
    return null;
  }
}

/**
 * Step 1: Request OTP for signup
 */
async function requestSignupOTP() {
  console.log('\n📧 Step 1: Requesting signup OTP...');
  console.log(`   Email: ${TEST_EMAIL}`);

  const response = await makeRequest('POST', `${API_URL}/auth/signup/request-otp`, {
    email: TEST_EMAIL
  });

  if (response.success) {
    console.log('✅ OTP request successful');
    // Wait a bit for OTP to be saved to DB
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } else {
    if (response.status === 409) {
      console.log('⚠️  User already exists. Trying to login instead...');
      return false; // User exists, try login
    } else {
      console.log(`❌ OTP request failed: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(response.data)}`);
      return false;
    }
  }
}

/**
 * Step 2: Complete signup with OTP
 */
async function completeSignup(otp) {
  console.log('\n🔐 Step 2: Completing signup...');
  console.log(`   Using OTP: ${otp}`);

  const response = await makeRequest('POST', `${API_URL}/auth/signup`, {
    firstName: TEST_FIRST_NAME,
    lastName: TEST_LAST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    otp: otp
  });

  if (response.success) {
    console.log('✅ Signup successful');
    if (response.data.token) {
      authToken = response.data.token;
      console.log(`   Token: ${authToken.substring(0, 30)}...`);
      return true;
    }
  } else {
    console.log(`❌ Signup failed: ${response.status}`);
    console.log(`   Error: ${JSON.stringify(response.data)}`);
    return false;
  }
}

/**
 * Step 3: Login (if user already exists)
 */
async function login() {
  console.log('\n🔐 Step 3: Logging in...');

  const response = await makeRequest('POST', `${API_URL}/auth/login`, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (response.success && response.data.token) {
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    return true;
  } else {
    console.log(`❌ Login failed: ${response.status}`);
    console.log(`   Error: ${JSON.stringify(response.data)}`);
    return false;
  }
}

/**
 * Step 4: Test item creation with the new account
 */
async function testItemCreation() {
  console.log('\n🧪 Step 4: Testing item creation...');

  const testItem = {
    name: 'Test Item from New Account',
    description: 'This is a test item created using the new test account for Flow 2 testing.',
    item_type: 'PHYSICAL',
    category: 'electronics',
    price: 99.99,
    condition: 'new',
    weight: 2.5,
    length: 10,
    width: 5,
    height: 2
  };

  const response = await makeRequest('POST', `${API_URL}/items`, testItem, {
    'Authorization': `Bearer ${authToken}`
  });

  if (response.success) {
    console.log('✅ Item creation successful');
    console.log(`   Item ID: ${response.data.data?._id || 'N/A'}`);
    console.log(`   Item Name: ${response.data.data?.name || 'N/A'}`);
    return true;
  } else {
    console.log(`❌ Item creation failed: ${response.status}`);
    console.log(`   Error: ${JSON.stringify(response.data)}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Creating Test Account for Flow 2 Testing (Auto OTP)');
  console.log('='.repeat(50));
  console.log(`Test Account Details:`);
  console.log(`  Email: ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  Name: ${TEST_FIRST_NAME} ${TEST_LAST_NAME}`);
  console.log('='.repeat(50));

  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Step 1: Request OTP
    const otpRequested = await requestSignupOTP();

    if (otpRequested) {
      // Step 2: Get OTP from MongoDB
      console.log('\n📝 Retrieving OTP from MongoDB...');
      const otp = await getOTPFromDB(TEST_EMAIL);

      if (!otp) {
        console.log('❌ OTP not found in database. Please check MongoDB or use manual script.');
        await mongoose.connection.close();
        process.exit(1);
      }

      console.log(`✅ OTP retrieved: ${otp}`);

      // Step 3: Complete signup
      const signupSuccess = await completeSignup(otp);
      if (!signupSuccess) {
        console.log('\n⚠️  Signup failed. Trying login instead...');
        const loginSuccess = await login();
        if (!loginSuccess) {
          console.log('\n❌ Both signup and login failed. Exiting.');
          await mongoose.connection.close();
          process.exit(1);
        }
      }
    } else {
      // User exists, try login
      const loginSuccess = await login();
      if (!loginSuccess) {
        console.log('\n❌ Login failed. Please check credentials or create account manually.');
        await mongoose.connection.close();
        process.exit(1);
      }
    }

    // Step 4: Test item creation
    await testItemCreation();

    // Success summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test Account Setup Complete!');
    console.log('='.repeat(50));
    console.log(`\nAccount Credentials:`);
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log(`\nAuth Token:`);
    console.log(`  ${authToken}`);
    console.log(`\n💡 You can now use these credentials for Flow 2 testing.`);
    console.log(`💡 Save this token for use in test scripts.`);

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  TEST_EMAIL,
  TEST_PASSWORD,
  TEST_FIRST_NAME,
  TEST_LAST_NAME,
  makeRequest,
  requestSignupOTP,
  completeSignup,
  login,
  testItemCreation
};

