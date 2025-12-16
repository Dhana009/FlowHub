/**
 * Logger Utility
 * 
 * Simple logging utility for development and production.
 * In production, can be replaced with a proper logging library.
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Log info message
 * 
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
function logInfo(message, data = null) {
  if (NODE_ENV === 'development') {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

/**
 * Log error message
 * 
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function logError(message, error = null) {
  console.error(`[ERROR] ${message}`, error ? error.stack : '');
}

/**
 * Log warning message
 * 
 * @param {string} message - Warning message
 * @param {any} data - Optional data to log
 */
function logWarn(message, data = null) {
  console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

module.exports = {
  logInfo,
  logError,
  logWarn
};

