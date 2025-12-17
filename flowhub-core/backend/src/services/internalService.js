/**
 * Internal Service (Automation Hooks)
 * 
 * Provides utility methods for high-scale automation.
 * ONLY FOR USE IN DEVELOPMENT MODE.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const OTP = require('../models/OTP');
const BulkJob = require('../models/BulkJob');
const ActivityLog = require('../models/ActivityLog');

/**
 * Total Reset: Wipes all collections for a clean test start.
 */
async function resetDatabase() {
  // Wiping all relevant collections
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    OTP.deleteMany({}),
    BulkJob.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);

  return { message: 'Database wiped successfully' };
}

/**
 * Fetch the latest OTP for an email.
 * Prevents tests from needing to "read the console".
 */
async function getLatestOTP(email) {
  if (!email) throw new Error('Email is required');

  const otpRecord = await OTP.findOne({ 
    email: email.toLowerCase(),
    isUsed: false 
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error(`No active OTP found for ${email}`);
  }

  return {
    email: otpRecord.email,
    otp: otpRecord.otpPlain,
    type: otpRecord.type,
    expiresAt: otpRecord.expiresAt
  };
}

/**
 * Fast Seeding: Injects multiple items instantly.
 */
async function seedItems(userId, count = 10) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const items = [];
  const categories = ['Electronics', 'Home', 'Books', 'Fashion'];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const name = `Auto Item ${Date.now()} ${i}`;
    
    // Manually calculate normalization for speed (bypassing pre-save hooks for bulk insert)
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedCategory = category.trim().replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    items.push({
      name,
      normalizedName,
      normalizedNamePrefix: normalizedName.substring(0, 5),
      description: `Automated test item ${i} for scale testing.`,
      item_type: 'DIGITAL',
      price: 10 + i,
      category,
      normalizedCategory,
      download_url: 'https://example.com/test',
      file_size: 1024,
      created_by: userId,
      is_active: true,
      version: 1
    });
  }

  // Use insertMany for high speed
  const result = await Item.insertMany(items);
  return {
    message: `Successfully seeded ${result.length} items`,
    count: result.length
  };
}

module.exports = {
  resetDatabase,
  getLatestOTP,
  seedItems
};

