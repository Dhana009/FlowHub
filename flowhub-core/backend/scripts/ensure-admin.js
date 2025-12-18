const mongoose = require('mongoose');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/password');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flowhub');
    console.log('Connected to MongoDB');

    const hashedPassword = await hashPassword('Admin@123');

    const existingUser = await User.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      console.log('Admin user already exists. Updating password...');
      existingUser.passwordHash = hashedPassword;
      existingUser.role = 'ADMIN';
      existingUser.isActive = true;
      await existingUser.save();
    } else {
      console.log('Creating new admin user...');
      const admin = new User({
        firstName: 'Admin',
        lastName: 'Test',
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true
      });
      await admin.save();
    }

    console.log('Admin user ready: admin@test.com / Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
