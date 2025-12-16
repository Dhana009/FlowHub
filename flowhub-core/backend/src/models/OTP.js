/**
 * OTP Model
 * 
 * MongoDB schema for One-Time Passwords (OTPs).
 * Used for signup verification and password reset.
 */

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
    // Note: OTP is stored as hash for security
  },
  otpPlain: {
    type: String,
    required: true, // Always required - OTP must be stored in plain text
    select: true // Explicitly include in queries
    // Plain text OTP - always stored for database access and debugging
  },
  type: {
    type: String,
    required: [true, 'OTP type is required'],
    enum: {
      values: ['signup', 'password-reset'],
      message: 'OTP type must be either "signup" or "password-reset"'
    },
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expireAfterSeconds: 0 } // TTL index - auto-delete expired documents
  },
  attempts: {
    type: Number,
    default: 0
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true, // Automatically adds createdAt
  strict: true // Ensure all fields in schema are saved
});

// Compound index for fast lookup by email and type
otpSchema.index({ email: 1, type: 1 });

// Index for cleanup queries
otpSchema.index({ createdAt: -1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;

