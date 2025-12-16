/**
 * OTP Service
 * 
 * Handles OTP generation, storage, and verification.
 * Manages OTP rate limiting and expiration.
 */

const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');

const OTP_EXPIRY_MINUTES = 10;
const OTP_RATE_LIMIT_MINUTES = 15;
const OTP_RATE_LIMIT_COUNT = 3;
const OTP_HASH_ROUNDS = 10;

/**
 * Generate a random 6-digit OTP
 * 
 * @returns {string} - 6-digit OTP string
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in database (hashed + plain text)
 * 
 * @param {string} email - User email (lowercase)
 * @param {string} otp - 6-digit OTP (plain text)
 * @param {string} type - OTP type ('signup' or 'password-reset')
 * @returns {Promise<object>} - OTP document
 */
async function storeOTP(email, otp, type) {
  // Hash OTP before storing (for security/verification)
  const otpHash = await bcrypt.hash(otp, OTP_HASH_ROUNDS);

  // Calculate expiration (10 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Create OTP document
  // Store both hashed (for verification) and plain text (for database lookup)
  const otpData = {
    email: email.toLowerCase(),
    otp: otpHash,        // Hashed version for secure verification
    otpPlain: otp,       // Plain text - always stored for database access
    type: type,
    expiresAt: expiresAt
  };

  const otpDoc = await OTP.create(otpData);

  // Verify otpPlain was saved
  const savedDoc = await OTP.findById(otpDoc._id).lean();
  
  if (!savedDoc || !savedDoc.otpPlain) {
    console.error('[OTP Service] ERROR: otpPlain was not saved to database!', {
      email: otpData.email,
      otpPlain: otpData.otpPlain,
      savedDoc: savedDoc ? Object.keys(savedDoc) : 'null'
    });
  }

  return otpDoc;
}

/**
 * Verify OTP (without marking as used)
 * Used for verify-otp endpoint - just validates the OTP
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP (plain text)
 * @param {string} type - OTP type
 * @returns {Promise<boolean>} - True if OTP is valid
 * @throws {Error} - If OTP is invalid, expired, or already used
 */
async function verifyOTP(email, otp, type) {
  // Find OTP record (not used, not expired, matching type)
  const otpDoc = await OTP.findOne({
    email: email.toLowerCase(),
    type: type,
    isUsed: false,
    expiresAt: { $gt: new Date() } // Not expired
  }).sort({ createdAt: -1 }); // Get most recent

  if (!otpDoc) {
    throw new Error('Invalid or expired OTP');
  }

  // Verify OTP hash FIRST before incrementing attempts
  const isValid = await bcrypt.compare(otp, otpDoc.otp);

  if (!isValid) {
    // Increment attempts only if OTP is invalid
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new Error('Invalid OTP');
  }

  // OTP is valid - but DON'T mark as used yet
  // It will be marked as used in the signup endpoint
  // This allows verify-otp to just validate, and signup to consume
  otpDoc.attempts += 1; // Track that this was a successful verification
  await otpDoc.save();

  return true;
}

/**
 * Consume OTP (mark as used)
 * Used in signup endpoint after OTP has been verified
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP (plain text)
 * @param {string} type - OTP type
 * @returns {Promise<boolean>} - True if OTP was successfully consumed
 * @throws {Error} - If OTP is invalid, expired, or already used
 */
async function consumeOTP(email, otp, type) {
  // Find OTP record (not used, not expired, matching type)
  const otpDoc = await OTP.findOne({
    email: email.toLowerCase(),
    type: type,
    isUsed: false,
    expiresAt: { $gt: new Date() } // Not expired
  }).sort({ createdAt: -1 }); // Get most recent

  if (!otpDoc) {
    throw new Error('Invalid or expired OTP');
  }

  // Verify OTP hash
  const isValid = await bcrypt.compare(otp, otpDoc.otp);

  if (!isValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new Error('Invalid OTP');
  }

  // OTP is valid - mark as used (consumed)
  otpDoc.isUsed = true;
  await otpDoc.save();

  return true;
}

/**
 * Check OTP rate limit
 * 
 * @param {string} email - User email
 * @param {string} type - OTP type
 * @returns {Promise<boolean>} - True if allowed (under limit)
 */
async function checkOTPRateLimit(email, type) {
  const fifteenMinutesAgo = new Date();
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - OTP_RATE_LIMIT_MINUTES);

  // Count OTP requests in last 15 minutes
  const count = await OTP.countDocuments({
    email: email.toLowerCase(),
    type: type,
    createdAt: { $gte: fifteenMinutesAgo }
  });

  return count < OTP_RATE_LIMIT_COUNT;
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  consumeOTP,
  checkOTPRateLimit
};

