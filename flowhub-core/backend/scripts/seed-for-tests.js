const mongoose = require('mongoose');
const User = require('../src/models/User');
const internalService = require('../src/services/internalService');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      console.error('Admin user not found. Run ensure-admin.js first.');
      process.exit(1);
    }

    console.log(`Found User ID: ${user._id}`);
    console.log('Seeding items...');
    
    const result = await internalService.seedItems(user._id, 20);
    console.log('Seeding successful:', result.message);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
