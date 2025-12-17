/**
 * File Upload Middleware
 * 
 * Handles file uploads for items using Multer.
 * Validates file type and size according to Flow 2 requirements.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-uuid.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    const error = new Error(`File type ${fileExt} not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    error.statusCode = 415;
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  // Check MIME type (if provided)
  if (file.mimetype && !ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    const error = new Error(`File type ${file.mimetype} not supported. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`);
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
const uploadSingle = upload.single('file');

// Middleware wrapper to handle errors properly
const handleFileUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'File too large. Max size: 5MB',
            statusCode: 413
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
          error: err.message || 'Unsupported media type',
          statusCode: 415
        });
      }

      // Generic error
      return res.status(500).json({
        error: 'File upload failed',
        statusCode: 500
      });
    }

    // Additional validation: Check file size if file was uploaded
    if (req.file) {
      if (req.file.size < MIN_FILE_SIZE) {
        // Delete the uploaded file
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting file:', unlinkErr);
          }
        });
        return res.status(413).json({
          error: 'File too small. Min size: 1KB',
          statusCode: 413
        });
      }

      // Store file metadata in request for controller use
      req.fileMetadata = {
        original_name: req.file.originalname,
        content_type: req.file.mimetype,
        size: req.file.size,
        uploaded_at: new Date()
      };
    }

    next();
  });
};

module.exports = {
  uploadSingle,
  handleFileUpload,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS
};

