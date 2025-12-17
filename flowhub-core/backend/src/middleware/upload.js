/**
 * File Upload Middleware
 * 
 * Handles file uploads for items using Multer.
 * Validates file type and size according to Flow 2 requirements.
 */

const multer = require('multer');

// File upload configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
const MIN_FILE_SIZE = 1024; // 1 KB in bytes
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];
// File extensions are validated by MIME type

// Upload directory will be created by fileService
// Using memory storage for two-phase commit pattern

// Storage configuration - Use memory storage for two-phase commit pattern
// File will be stored in memory buffer, then moved to permanent location after item creation
const storage = multer.memoryStorage();

// File filter function - basic MIME type check
// Detailed validation happens in validation service (Layer 3)
const fileFilter = (req, file, cb) => {
  // Basic MIME type check (detailed validation in validation service)
  if (file.mimetype && !ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    const error = new Error(`File type ${file.mimetype} not supported`);
    error.statusCode = 415;
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Single file upload for now (can be increased if needed)
  }
});

// Middleware for single file upload
// Field name matches API contract: 'file'
const uploadSingle = upload.single('file');

// Middleware wrapper to handle errors properly
const handleFileUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            status: 'error',
            error_code: 413,
            error_type: 'Payload Too Large',
            message: 'File size exceeds 5 MB limit',
            timestamp: new Date().toISOString(),
            path: req.path
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files. Maximum 1 file allowed',
            statusCode: 400
          });
        }
        return res.status(400).json({
          error: err.message || 'File upload error',
          statusCode: 400
        });
      }

      // Handle custom errors (file type validation)
      if (err.statusCode === 415) {
        return res.status(415).json({
          status: 'error',
          error_code: 415,
          error_type: 'Unsupported Media Type',
          message: err.message || 'File type not allowed. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }

      // Generic error
      return res.status(500).json({
        error: 'File upload failed',
        statusCode: 500
      });
    }

    // File is stored in memory buffer (req.file.buffer)
    // File validation will be done in validation service (Layer 3)
    // No need to validate here - just pass through to controller

    next();
  });
};

module.exports = {
  uploadSingle,
  handleFileUpload,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};

