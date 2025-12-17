/**
 * Internal Controller (Automation Hooks)
 * 
 * Handles requests for database resets, OTP retrieval, and seeding.
 * ONLY FOR USE IN DEVELOPMENT MODE.
 */

const internalService = require('../services/internalService');

/**
 * Protect against unauthorized internal calls
 */
function authorizeInternal(req, res) {
  const providedKey = req.headers['x-internal-key'];
  const secretKey = process.env.INTERNAL_AUTOMATION_KEY || 'flowhub-secret-automation-key-2025';

  if (!providedKey || providedKey !== secretKey) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing Internal Safety Key'
    });
    return false;
  }
  return true;
}

/**
 * POST /api/v1/internal/reset
 */
async function resetDB(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const result = await internalService.resetDatabase();
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/internal/otp
 */
async function getOTP(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email query param is required' });
    }
    const result = await internalService.getLatestOTP(email);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/internal/seed
 */
async function seedData(req, res, next) {
  try {
    if (!authorizeInternal(req, res)) return;
    const { userId, count } = req.body;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'userId is required' });
    }
    const result = await internalService.seedItems(userId, count);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  resetDB,
  getOTP,
  seedData
};

