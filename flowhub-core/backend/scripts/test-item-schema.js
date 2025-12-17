/**
 * Item Schema Validation Test Script
 * 
 * Tests the Item model schema validation rules.
 * Run with: node scripts/test-item-schema.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Item = require('../src/models/Item');

async function testItemSchema() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get a test user ID (or create one if needed)
    const User = require('../src/models/User');
    let testUser = await User.findOne();
    
    if (!testUser) {
      console.log('⚠️  No test user found. Please create a user first via signup.');
      process.exit(1);
    }

    const testUserId = testUser._id;
    console.log(`✅ Using test user: ${testUser.email}`);

    console.log('\n🧪 Testing Item Schema Validation...\n');

    // Test 1: Valid PHYSICAL item
    console.log('Test 1: Valid PHYSICAL item');
    try {
      const validPhysicalItem = new Item({
        name: 'Laptop Computer',
        description: 'High-performance laptop for software development',
        item_type: 'PHYSICAL',
        price: 1299.99,
        category: 'Electronics',
        tags: ['laptop', 'computer'],
        weight: 2.5,
        dimensions: {
          length: 35.5,
          width: 24.0,
          height: 2.0
        },
        created_by: testUserId
      });

      await validPhysicalItem.save();
      console.log('✅ Valid PHYSICAL item created successfully');
      console.log(`   Item ID: ${validPhysicalItem._id}`);
      
      // Clean up
      await Item.deleteOne({ _id: validPhysicalItem._id });
      console.log('   ✅ Test item cleaned up\n');
    } catch (error) {
      console.log('❌ Valid PHYSICAL item failed:', error.message);
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 2: Valid DIGITAL item
    console.log('Test 2: Valid DIGITAL item');
    try {
      const validDigitalItem = new Item({
        name: 'Software License',
        description: 'Premium software license for professional use',
        item_type: 'DIGITAL',
        price: 299.99,
        category: 'Software',
        tags: ['license', 'software'],
        download_url: 'https://example.com/download/software.zip',
        file_size: 52428800,
        created_by: testUserId
      });

      await validDigitalItem.save();
      console.log('✅ Valid DIGITAL item created successfully');
      console.log(`   Item ID: ${validDigitalItem._id}`);
      
      // Clean up
      await Item.deleteOne({ _id: validDigitalItem._id });
      console.log('   ✅ Test item cleaned up\n');
    } catch (error) {
      console.log('❌ Valid DIGITAL item failed:', error.message);
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 3: Valid SERVICE item
    console.log('Test 3: Valid SERVICE item');
    try {
      const validServiceItem = new Item({
        name: 'Consulting Service',
        description: 'Professional consulting service for software architecture',
        item_type: 'SERVICE',
        price: 150.00,
        category: 'Services',
        tags: ['consulting', 'architecture'],
        duration_hours: 8,
        created_by: testUserId
      });

      await validServiceItem.save();
      console.log('✅ Valid SERVICE item created successfully');
      console.log(`   Item ID: ${validServiceItem._id}`);
      
      // Clean up
      await Item.deleteOne({ _id: validServiceItem._id });
      console.log('   ✅ Test item cleaned up\n');
    } catch (error) {
      console.log('❌ Valid SERVICE item failed:', error.message);
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 4: Invalid item - missing required fields
    console.log('Test 4: Invalid item - missing required fields');
    try {
      const invalidItem = new Item({
        name: 'X', // Too short
        description: 'Short', // Too short
        // Missing item_type, price, category
        created_by: testUserId
      });

      await invalidItem.save();
      console.log('❌ Invalid item should not have been created');
    } catch (error) {
      console.log('✅ Invalid item properly rejected');
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 5: Invalid item - PHYSICAL without weight/dimensions
    console.log('Test 5: Invalid item - PHYSICAL without weight/dimensions');
    try {
      const invalidPhysicalItem = new Item({
        name: 'Test Physical Item',
        description: 'This is a test physical item description',
        item_type: 'PHYSICAL',
        price: 99.99,
        category: 'Electronics',
        // Missing weight and dimensions
        created_by: testUserId
      });

      await invalidPhysicalItem.save();
      console.log('❌ PHYSICAL item without weight/dimensions should not have been created');
    } catch (error) {
      console.log('✅ PHYSICAL item without weight/dimensions properly rejected');
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 6: Invalid item - invalid item_type
    console.log('Test 6: Invalid item - invalid item_type');
    try {
      const invalidTypeItem = new Item({
        name: 'Test Item',
        description: 'This is a test item description',
        item_type: 'INVALID_TYPE',
        price: 99.99,
        category: 'Test',
        created_by: testUserId
      });

      await invalidTypeItem.save();
      console.log('❌ Item with invalid type should not have been created');
    } catch (error) {
      console.log('✅ Item with invalid type properly rejected');
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 7: Invalid item - price out of range
    console.log('Test 7: Invalid item - price out of range');
    try {
      const invalidPriceItem = new Item({
        name: 'Test Item',
        description: 'This is a test item description',
        item_type: 'PHYSICAL',
        price: -10, // Negative price
        category: 'Test',
        weight: 1.0,
        dimensions: { length: 10, width: 10, height: 10 },
        created_by: testUserId
      });

      await invalidPriceItem.save();
      console.log('❌ Item with invalid price should not have been created');
    } catch (error) {
      console.log('✅ Item with invalid price properly rejected');
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.log(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      console.log('');
    }

    // Test 8: Duplicate name + category (should fail due to unique index)
    console.log('Test 8: Duplicate name + category');
    try {
      const item1 = new Item({
        name: 'Duplicate Test Item',
        description: 'First item with this name and category',
        item_type: 'PHYSICAL',
        price: 99.99,
        category: 'Test',
        weight: 1.0,
        dimensions: { length: 10, width: 10, height: 10 },
        created_by: testUserId
      });
      await item1.save();
      console.log('✅ First item created');

      const item2 = new Item({
        name: 'Duplicate Test Item', // Same name
        description: 'Second item with same name and category',
        item_type: 'PHYSICAL',
        price: 199.99,
        category: 'Test', // Same category
        weight: 2.0,
        dimensions: { length: 20, width: 20, height: 20 },
        created_by: testUserId
      });
      await item2.save();
      console.log('❌ Duplicate item should not have been created');
      
      // Clean up
      await Item.deleteOne({ _id: item1._id });
      await Item.deleteOne({ _id: item2._id });
    } catch (error) {
      console.log('✅ Duplicate item properly rejected');
      console.log(`   Error: ${error.message}`);
      
      // Clean up first item if it exists
      await Item.deleteOne({ name: 'Duplicate Test Item', category: 'Test' });
      console.log('');
    }

    console.log('🎉 All schema validation tests completed!\n');

    // Check indexes
    console.log('📊 Checking indexes...');
    const indexes = await Item.collection.getIndexes();
    console.log(`✅ Found ${Object.keys(indexes).length} indexes:`);
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });

  } catch (error) {
    console.error('❌ Test script error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  }
}

// Run tests
testItemSchema();

