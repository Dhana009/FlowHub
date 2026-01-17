/**
 * Index Verification Script
 * 
 * Verifies that all required indexes exist on the items collection.
 * 
 * Run with: node scripts/verify-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function verifyIndexes() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB\n');
    console.log('Verifying indexes on items collection...\n');

    const db = mongoose.connection.db;
    const itemsCollection = db.collection('items');
    
    // Get all indexes
    const indexes = await itemsCollection.indexes();
    
    console.log('Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${index.name}`);
      console.log(`     Keys: ${JSON.stringify(index.key)}`);
      if (index.unique) {
        console.log(`     Unique: true`);
      }
      if (index.partialFilterExpression) {
        console.log(`     Partial Filter: ${JSON.stringify(index.partialFilterExpression)}`);
      }
      console.log('');
    });

    // Required indexes
    const requiredIndexes = [
      {
        name: 'unique_item_name_category_user',
        keys: { normalizedName: 1, normalizedCategory: 1, created_by: 1 },
        unique: true
      },
      {
        name: 'idx_category_item_type',
        keys: { normalizedCategory: 1, item_type: 1 }
      },
      {
        name: 'idx_similar_items',
        keys: { normalizedNamePrefix: 1, normalizedCategory: 1, created_by: 1, is_active: 1 }
      },
      {
        name: 'idx_created_by',
        keys: { created_by: 1 }
      },
      {
        name: 'idx_tags',
        keys: { tags: 1 }
      },
      {
        name: 'idx_created_at',
        keys: { createdAt: -1 }
      },
      {
        name: 'idx_active_created',
        keys: { is_active: 1, createdAt: -1 }
      }
    ];

    console.log('\nRequired indexes:');
    requiredIndexes.forEach((reqIndex, i) => {
      const exists = indexes.some(idx => idx.name === reqIndex.name);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${reqIndex.name}`);
      if (!exists) {
        console.log(`     Missing! Run migration to create this index.`);
      }
    });

    // Check for missing indexes
    const missingIndexes = requiredIndexes.filter(reqIndex => 
      !indexes.some(idx => idx.name === reqIndex.name)
    );

    if (missingIndexes.length === 0) {
      console.log('\n✅ All required indexes exist!');
    } else {
      console.log(`\n⚠️  Warning: ${missingIndexes.length} required indexes are missing`);
      console.log('   The application may not function correctly without these indexes.');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyIndexes();

