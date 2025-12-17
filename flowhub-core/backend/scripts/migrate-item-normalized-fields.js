/**
 * Migration Script: Add Normalized Fields to Items
 * 
 * This script adds normalized fields (normalizedName, normalizedNamePrefix, normalizedCategory)
 * to existing items in the database.
 * 
 * Run with: node scripts/migrate-item-normalized-fields.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../src/models/Item');

/**
 * Normalize name for comparison
 */
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Generate adaptive prefix for similarity matching
 */
function generatePrefix(normalizedName) {
  const nameLength = normalizedName.length;
  if (nameLength === 0) {
    return '';
  } else if (nameLength <= 2) {
    return normalizedName;
  } else if (nameLength <= 4) {
    return normalizedName.substring(0, nameLength - 1);
  } else {
    return normalizedName.substring(0, 5);
  }
}

/**
 * Normalize category to Title Case
 */
function normalizeCategory(category) {
  if (!category) return '';
  return category.trim().replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

async function migrateItems() {
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

    console.log('Connected to MongoDB');
    console.log('Starting migration...\n');

    // Find all items without normalized fields
    const items = await Item.find({
      $or: [
        { normalizedName: { $exists: false } },
        { normalizedNamePrefix: { $exists: false } },
        { normalizedCategory: { $exists: false } }
      ]
    });

    console.log(`Found ${items.length} items to migrate\n`);

    if (items.length === 0) {
      console.log('No items need migration. All items already have normalized fields.');
      await mongoose.connection.close();
      return;
    }

    let migrated = 0;
    let errors = 0;

    // Migrate each item
    for (const item of items) {
      try {
        const normalizedName = normalizeName(item.name);
        const normalizedNamePrefix = generatePrefix(normalizedName);
        const normalizedCategory = normalizeCategory(item.category);

        await Item.updateOne(
          { _id: item._id },
          {
            $set: {
              normalizedName,
              normalizedNamePrefix,
              normalizedCategory
            }
          }
        );

        migrated++;
        if (migrated % 100 === 0) {
          console.log(`Migrated ${migrated} items...`);
        }
      } catch (error) {
        console.error(`Error migrating item ${item._id}:`, error.message);
        errors++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Migrated: ${migrated} items`);
    console.log(`- Errors: ${errors} items`);

    // Verify migration
    const remaining = await Item.countDocuments({
      $or: [
        { normalizedName: { $exists: false } },
        { normalizedNamePrefix: { $exists: false } },
        { normalizedCategory: { $exists: false } }
      ]
    });

    if (remaining === 0) {
      console.log('\n✅ All items have normalized fields!');
    } else {
      console.log(`\n⚠️  Warning: ${remaining} items still missing normalized fields`);
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateItems();

