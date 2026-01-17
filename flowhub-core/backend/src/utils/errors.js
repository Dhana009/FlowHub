/**
 * Custom Error Classes
 * 
 * Provides structured error classes for different validation layers
 * and error types.
 */

/**
 * Base validation error class
 */
class ValidationError extends Error {
  constructor(message, layer, statusCode = 422, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.layer = layer;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Schema validation error (Layer 2)
 */
class SchemaValidationError extends ValidationError {
  constructor(message, details = null) {
    super(message, 2, 422, details);
    this.name = 'SchemaValidationError';
  }
}

/**
 * File validation error (Layer 3)
 */
class FileValidationError extends ValidationError {
  constructor(message, statusCode = 415, details = null) {
    super(message, 3, statusCode, details);
    this.name = 'FileValidationError';
  }
}

/**
 * Business rule validation error (Layer 4)
 */
class BusinessRuleError extends ValidationError {
  constructor(message, details = null) {
    super(message, 4, 400, details);
    this.name = 'BusinessRuleError';
  }
}

/**
 * Duplicate detection error (Layer 5)
 */
class DuplicateError extends ValidationError {
  constructor(message, details = null) {
    super(message, 5, 409, details);
    this.name = 'DuplicateError';
  }
}

module.exports = {
  ValidationError,
  SchemaValidationError,
  FileValidationError,
  BusinessRuleError,
  DuplicateError
};

