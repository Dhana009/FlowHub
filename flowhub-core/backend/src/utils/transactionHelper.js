/**
 * Transaction Helper Utility
 * 
 * Provides utilities for working with MongoDB transactions.
 * Supports retry logic with exponential backoff for transaction conflicts.
 */

const mongoose = require('mongoose');

/**
 * Execute a function within a MongoDB transaction
 * 
 * @param {Function} callback - Function to execute within transaction
 * @param {Object} options - Transaction options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.retryDelay - Initial retry delay in ms (default: 100)
 * @returns {Promise<any>} Result of callback function
 */
async function withTransaction(callback, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 100
  } = options;

  // Check if MongoDB supports transactions (replica set or mongos)
  // MongoDB Memory Server and standalone instances don't support transactions
  const supportsTransactions = mongoose.connection.readyState === 1 && 
    (mongoose.connection.host?.includes('replica') || 
     mongoose.connection.db?.admin()?.command({ isMaster: 1 })?.then?.(() => true).catch?.(() => false) ||
     false);

  // If transactions aren't supported, execute callback without transaction
  // This is common in test environments using MongoDB Memory Server
  if (!supportsTransactions) {
    try {
      // Execute callback with null session (caller should handle this)
      return await callback(null);
    } catch (error) {
      // Check if error is transaction-related and ignore it
      if (error.message?.includes('Transaction numbers are only allowed') ||
          error.message?.includes('replica set')) {
        // Fallback: execute without session
        return await callback(null);
      }
      throw error;
    }
  }

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const result = await callback(session);
      
      await session.commitTransaction();
      session.endSession();
      
      return result;
      
    } catch (error) {
      await session.abortTransaction().catch(() => {}); // Ignore abort errors
      session.endSession();
      
      lastError = error;
      
      // Check if error is transaction-related (not supported)
      if (error.message?.includes('Transaction numbers are only allowed') ||
          error.message?.includes('replica set')) {
        // Fallback: execute without session
        return await callback(null);
      }
      
      // Check if error is retryable (transaction conflict)
      if (isRetryableError(error) && attempt < maxRetries - 1) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Transaction conflict, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Not retryable or max retries reached
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Check if an error is retryable (transaction conflict)
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error) {
  // MongoDB transaction conflict errors
  if (error.code === 251) { // WriteConflict
    return true;
  }
  
  // Duplicate key error during transaction (race condition)
  if (error.code === 11000) {
    return true;
  }
  
  // Network errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    return true;
  }
  
  return false;
}

/**
 * Create a session for manual transaction management
 * 
 * @returns {Promise<mongoose.ClientSession>} MongoDB session
 */
async function createSession() {
  return await mongoose.startSession();
}

module.exports = {
  withTransaction,
  isRetryableError,
  createSession
};

