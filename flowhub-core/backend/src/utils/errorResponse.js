/**
 * Error Response Utility
 * 
 * Provides consistent error response formatting to match Flow 1 error format.
 * All errors should return: { error: string, statusCode: number }
 */

/**
 * Format Mongoose validation errors into a single error message
 * @param {Error} error - Mongoose validation error
 * @returns {string} - Formatted error message
 */
function formatValidationError(error) {
  if (error.name === 'ValidationError' && error.errors) {
    // Get first error message
    const firstError = Object.values(error.errors)[0];
    return firstError.message || 'Validation error';
  }
  return error.message || 'Validation error';
}

/**
 * Create a custom error with statusCode
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Error object with statusCode
 */
function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Send error response in consistent format
 * @param {object} res - Express response object
 * @param {string|Error} error - Error message or Error object
 * @param {number} statusCode - HTTP status code (if error is string)
 */
function sendErrorResponse(res, error, statusCode = null) {
  let message;
  let code;

  if (error instanceof Error) {
    message = error.message || 'Internal Server Error';
    code = error.statusCode || statusCode || 500;
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      message = formatValidationError(error);
      code = 422;
    }
    
    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      message = 'Item with same name and category already exists';
      code = 409;
    }
  } else {
    message = error || 'Internal Server Error';
    code = statusCode || 500;
  }

  res.status(code).json({
    error: message,
    statusCode: code
  });
}

/**
 * Handle Mongoose errors and convert to appropriate HTTP errors
 * @param {Error} error - Mongoose error
 * @returns {Error} - Formatted error with statusCode
 */
function handleMongooseError(error) {
  // Validation error
  if (error.name === 'ValidationError') {
    const formattedError = createError(formatValidationError(error), 422);
    return formattedError;
  }

  // Duplicate key error
  if (error.code === 11000) {
    return createError('Item with same name and category already exists', 409);
  }

  // Cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return createError('Invalid ID format', 400);
  }

  // Default to 500
  return createError(error.message || 'Database error', 500);
}

module.exports = {
  formatValidationError,
  createError,
  sendErrorResponse,
  handleMongooseError
};

