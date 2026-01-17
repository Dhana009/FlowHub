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

  // Build high-fidelity error response for Automation Frameworks
  const errorResponse = {
    status: 'error',
    error_code: statusCode,
    error_type: getErrorType(statusCode, err.layer || err.errorCodeDetail),
    message: message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add detail if available (e.g. VERSION_CONFLICT)
  if (err.errorCodeDetail) {
    errorResponse.error_code_detail = err.errorCodeDetail;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Get error type string based on status code and detail
 */
function getErrorType(statusCode, detail) {
  if (statusCode === 409 && detail) {
    const conflictTypes = {
      'VERSION_CONFLICT': 'Conflict - Version mismatch',
      'ITEM_DELETED': 'Conflict - Item deleted',
      'ITEM_INACTIVE': 'Conflict - Item inactive',
      'DUPLICATE': 'Conflict - Duplicate item'
    };
    return conflictTypes[detail] || 'Conflict';
  }

  const errorTypes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    413: 'Payload Too Large',
    415: 'Unsupported Media Type',
    422: 'Unprocessable Entity - Validation failed',
    429: 'Too Many Requests',
    500: 'Internal Server Error'
  };
  
  return errorTypes[statusCode] || 'Error';
}

module.exports = errorHandler;

