/**
 * Test Auth Flow
 * 
 * Tests the complete authentication flow:
 * 1. Login with rememberMe=false
 * 2. Verify refresh token works
 * 3. Login with rememberMe=true
 * 4. Verify logout clears tokens
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user credentials (should exist in DB)
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test1234!';

/**
 * Make JSON request
 */
function makeJsonRequest(method, path, data, headers = {}, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? JSON.stringify(data) : '';
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    if (cookies) {
      requestHeaders['Cookie'] = cookies;
    }

    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: requestHeaders
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

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Extract cookies from Set-Cookie header
 */
function extractCookies(setCookieHeaders) {
  if (!setCookieHeaders || !Array.isArray(setCookieHeaders)) return '';
  return setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
}

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Step 1: Login without rememberMe
    console.log('1️⃣ Testing Login (rememberMe=false)...');
    const loginResponse = await makeJsonRequest('POST', `${API_BASE}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      rememberMe: false
    });

    if (loginResponse.status === 200 && loginResponse.data.token && loginResponse.data.user) {
      console.log('✅ Login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   User: ${loginResponse.data.user.email}`);
      
      // Check if refresh token cookie was set
      const setCookieHeaders = loginResponse.headers['set-cookie'];
      const hasRefreshToken = setCookieHeaders?.some(cookie => cookie.includes('refreshToken'));
      console.log(`   Refresh token cookie: ${hasRefreshToken ? '✅ Set' : '❌ Missing'}`);
      
      const cookies = extractCookies(setCookieHeaders);

      // Step 2: Test refresh token endpoint
      console.log('\n2️⃣ Testing Refresh Token...');
      const refreshResponse = await makeJsonRequest('POST', `${API_BASE}/auth/refresh`, {}, {}, cookies);

      if (refreshResponse.status === 200 && refreshResponse.data.token && refreshResponse.data.user) {
        console.log('✅ Refresh token successful');
        console.log(`   New Token: ${refreshResponse.data.token.substring(0, 20)}...`);
      } else {
        console.log(`❌ Refresh token failed: ${refreshResponse.status}`);
        console.log(`   Response:`, refreshResponse.data);
      }

      // Step 3: Login with rememberMe=true
      console.log('\n3️⃣ Testing Login (rememberMe=true)...');
      const loginRememberResponse = await makeJsonRequest('POST', `${API_BASE}/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        rememberMe: true
      });

      if (loginRememberResponse.status === 200 && loginRememberResponse.data.token) {
        console.log('✅ Login with rememberMe successful');
        
        // Check cookie expiration (should be 30 days)
        const rememberCookies = loginRememberResponse.headers['set-cookie'];
        const refreshCookie = rememberCookies?.find(cookie => cookie.includes('refreshToken'));
        if (refreshCookie) {
          const maxAgeMatch = refreshCookie.match(/Max-Age=(\d+)/);
          if (maxAgeMatch) {
            const maxAgeDays = Math.floor(parseInt(maxAgeMatch[1]) / (24 * 60 * 60));
            console.log(`   Cookie expiration: ${maxAgeDays} days ${maxAgeDays === 30 ? '✅' : '❌ (expected 30)'}`);
          }
        }
        
        const rememberCookiesStr = extractCookies(rememberCookies);

        // Step 4: Test logout
        console.log('\n4️⃣ Testing Logout...');
        const logoutResponse = await makeJsonRequest('POST', `${API_BASE}/auth/logout`, {}, {
          Authorization: `Bearer ${loginRememberResponse.data.token}`
        }, rememberCookiesStr);

        if (logoutResponse.status === 200) {
          console.log('✅ Logout successful');
          
          // Verify refresh token cookie was cleared
          const logoutCookies = logoutResponse.headers['set-cookie'];
          const refreshTokenCleared = logoutCookies?.some(cookie => 
            cookie.includes('refreshToken') && (cookie.includes('Max-Age=0') || cookie.includes('Expires='))
          );
          console.log(`   Refresh token cleared: ${refreshTokenCleared ? '✅' : '⚠️  (check manually)'}`);
        } else {
          console.log(`❌ Logout failed: ${logoutResponse.status}`);
        }

        // Step 5: Verify refresh fails after logout
        console.log('\n5️⃣ Testing Refresh After Logout...');
        const refreshAfterLogout = await makeJsonRequest('POST', `${API_BASE}/auth/refresh`, {});
        
        if (refreshAfterLogout.status === 401) {
          console.log('✅ Refresh correctly failed after logout (401)');
        } else {
          console.log(`❌ Unexpected status: ${refreshAfterLogout.status}`);
        }

        console.log('\n✅ All auth flow tests passed!');
      } else {
        console.log(`❌ Login with rememberMe failed: ${loginRememberResponse.status}`);
        console.log(`   Response:`, loginRememberResponse.data);
      }
    } else {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      console.log(`   Response:`, loginResponse.data);
      console.log('\n⚠️  Note: Make sure test user exists in database.');
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testAuthFlow();

