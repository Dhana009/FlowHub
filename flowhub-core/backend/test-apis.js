/**
 * Test script for Item APIs (View, Edit, Delete)
 * 
 * Usage: node test-apis.js
 * 
 * This script tests:
 * - GET /api/v1/items (list)
 * - GET /api/v1/items/:id (view single)
 * - PUT /api/v1/items/:id (edit)
 * - DELETE /api/v1/items/:id (delete)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let createdItemId = '';

// Test user credentials (use your actual credentials)
const TEST_EMAIL = 'ff@gmail.com';
const TEST_PASSWORD = 'Demo@12337';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  try {
    log('\n=== Step 1: Login ===', 'blue');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      log('✓ Login successful', 'green');
      return true;
    } else {
      log('✗ Login failed: No token received', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function createTestItem() {
  try {
    log('\n=== Step 2: Create Test Item ===', 'blue');
    const itemData = {
      name: `Test Item ${Date.now()}`,
      description: 'This is a test item for API testing purposes',
      item_type: 'PHYSICAL',
      category: 'Electronics',
      price: 99.99,
      weight: 1.5,
      length: 10,
      width: 5,
      height: 2,
      tags: ['test', 'api']
    };

    const response = await axios.post(`${BASE_URL}/items`, itemData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201 && response.data.data) {
      createdItemId = response.data.data._id;
      log(`✓ Item created successfully: ${createdItemId}`, 'green');
      log(`  Name: ${response.data.data.name}`, 'yellow');
      return true;
    } else {
      log('✗ Item creation failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Item creation failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testGetItems() {
  try {
    log('\n=== Step 3: Test GET /api/v1/items (List) ===', 'blue');
    const response = await axios.get(`${BASE_URL}/items`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        page: 1,
        limit: 10
      }
    });

    if (response.status === 200) {
      log('✓ Get items list successful', 'green');
      log(`  Total items: ${response.data.data?.total || 0}`, 'yellow');
      log(`  Items returned: ${response.data.data?.items?.length || 0}`, 'yellow');
      return true;
    } else {
      log('✗ Get items list failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Get items list failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testGetItem() {
  try {
    log('\n=== Step 4: Test GET /api/v1/items/:id (View Single) ===', 'blue');
    if (!createdItemId) {
      log('✗ No item ID available', 'red');
      return false;
    }

    const response = await axios.get(`${BASE_URL}/items/${createdItemId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 200 && response.data.data) {
      log('✓ Get single item successful', 'green');
      log(`  Item ID: ${response.data.data._id}`, 'yellow');
      log(`  Name: ${response.data.data.name}`, 'yellow');
      log(`  Price: $${response.data.data.price}`, 'yellow');
      return true;
    } else {
      log('✗ Get single item failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Get single item failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testUpdateItem() {
  try {
    log('\n=== Step 5: Test PUT /api/v1/items/:id (Edit) ===', 'blue');
    if (!createdItemId) {
      log('✗ No item ID available', 'red');
      return false;
    }

    const updateData = {
      name: `Updated Test Item ${Date.now()}`,
      description: 'This is an updated test item description',
      price: 149.99,
      weight: 2.0
    };

    const response = await axios.put(`${BASE_URL}/items/${createdItemId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 && response.data.data) {
      log('✓ Update item successful', 'green');
      log(`  Updated Name: ${response.data.data.name}`, 'yellow');
      log(`  Updated Price: $${response.data.data.price}`, 'yellow');
      return true;
    } else {
      log('✗ Update item failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Update item failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testDeleteItem() {
  try {
    log('\n=== Step 6: Test DELETE /api/v1/items/:id (Delete) ===', 'blue');
    if (!createdItemId) {
      log('✗ No item ID available', 'red');
      return false;
    }

    const response = await axios.delete(`${BASE_URL}/items/${createdItemId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 200) {
      log('✓ Delete item successful', 'green');
      log(`  Message: ${response.data.message}`, 'yellow');
      return true;
    } else {
      log('✗ Delete item failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Delete item failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function testGetDeletedItem() {
  try {
    log('\n=== Step 7: Test GET /api/v1/items/:id (Deleted Item) ===', 'blue');
    if (!createdItemId) {
      log('✗ No item ID available', 'red');
      return false;
    }

    const response = await axios.get(`${BASE_URL}/items/${createdItemId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 404) {
      log('✓ Correctly returns 404 for deleted item', 'green');
      return true;
    } else {
      log(`✗ Expected 404 but got ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      log('✓ Correctly returns 404 for deleted item', 'green');
      return true;
    } else {
      log(`✗ Unexpected error: ${error.response?.data?.message || error.message}`, 'red');
      return false;
    }
  }
}

async function runTests() {
  log('\n========================================', 'blue');
  log('  Item API Test Suite', 'blue');
  log('========================================', 'blue');

  const results = {
    login: false,
    create: false,
    list: false,
    view: false,
    edit: false,
    delete: false,
    deletedView: false
  };

  // Step 1: Login
  results.login = await login();
  if (!results.login) {
    log('\n✗ Cannot proceed without authentication', 'red');
    return;
  }

  // Step 2: Create test item
  results.create = await createTestItem();
  if (!results.create) {
    log('\n✗ Cannot proceed without a test item', 'red');
    return;
  }

  // Step 3: Test GET /items (list)
  results.list = await testGetItems();

  // Step 4: Test GET /items/:id (view single)
  results.view = await testGetItem();

  // Step 5: Test PUT /items/:id (edit)
  results.edit = await testUpdateItem();

  // Step 6: Test DELETE /items/:id (delete)
  results.delete = await testDeleteItem();

  // Step 7: Test GET /items/:id (deleted item should return 404)
  results.deletedView = await testGetDeletedItem();

  // Summary
  log('\n========================================', 'blue');
  log('  Test Results Summary', 'blue');
  log('========================================', 'blue');
  log(`Login:        ${results.login ? '✓ PASS' : '✗ FAIL'}`, results.login ? 'green' : 'red');
  log(`Create Item:  ${results.create ? '✓ PASS' : '✗ FAIL'}`, results.create ? 'green' : 'red');
  log(`List Items:   ${results.list ? '✓ PASS' : '✗ FAIL'}`, results.list ? 'green' : 'red');
  log(`View Item:    ${results.view ? '✓ PASS' : '✗ FAIL'}`, results.view ? 'green' : 'red');
  log(`Edit Item:    ${results.edit ? '✓ PASS' : '✗ FAIL'}`, results.edit ? 'green' : 'red');
  log(`Delete Item:  ${results.delete ? '✓ PASS' : '✗ FAIL'}`, results.delete ? 'green' : 'red');
  log(`Deleted View: ${results.deletedView ? '✓ PASS' : '✗ FAIL'}`, results.deletedView ? 'green' : 'red');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  log(`\nTotal: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
}

// Run tests
runTests().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

