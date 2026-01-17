/**
 * User Model
 * 
 * MongoDB schema for user accounts.
 * Handles user authentication data, login attempts, and account lockout.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name must not exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name must not exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false // Never return passwordHash in queries by default
  },
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: {
      type: Date,
      default: null
    },
    lockedUntil: {
      type: Date,
      default: null,
      index: true
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['ADMIN', 'EDITOR', 'VIEWER'],
    default: 'EDITOR',
    required: true,
    index: true
  },
  roleChangedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove passwordHash from JSON output
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'loginAttempts.lockedUntil': 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

