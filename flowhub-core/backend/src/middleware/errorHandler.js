/**
 * Error Handler Middleware
 * 
 * Centralized error handling for Express routes.
 * Must be the last middleware in the chain.
 */

const { logError } = require('../utils/logger');

/**
 * Error handler middleware
 * 
 * @param {Error} err - Error object
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error
  logError('Request error', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Build error response
  const errorResponse = {
    error: message,
    statusCode: statusCode
  };

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;

