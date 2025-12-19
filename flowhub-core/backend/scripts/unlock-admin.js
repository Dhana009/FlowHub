const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function unlockAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub');
    console.log('Connected to MongoDB');

    await User.updateOne(
      { email: 'admin@test.com' },
      { 
        $set: { 
          'loginAttempts.count': 0, 
          'loginAttempts.lockedUntil': null, 
          isActive: true 
        } 
      }
    );
    console.log('Admin account unlocked and activated');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

unlockAdmin();





