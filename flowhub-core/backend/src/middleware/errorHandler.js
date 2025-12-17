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

  // Build error response - match PRD format for validation errors
  let errorResponse;
  
  // If error has layer (from validation service), use PRD format
  if (err.layer) {
    errorResponse = {
      status: 'error',
      error_code: statusCode,
      error_type: getErrorType(statusCode, err.layer),
      message: message,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  } else {
    // Standard error format
    errorResponse = {
      error: message,
      statusCode: statusCode
    };
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Get error type string based on status code and layer
 */
function getErrorType(statusCode, layer) {
  const errorTypes = {
    401: 'Unauthorized',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    422: 'Unprocessable Entity - Schema validation failed',
    400: 'Bad Request - Business rule validation failed',
    409: 'Conflict - Duplicate item',
    500: 'Internal Server Error'
  };
  
  return errorTypes[statusCode] || 'Error';
}

module.exports = errorHandler;

