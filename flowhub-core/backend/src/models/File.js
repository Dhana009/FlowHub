/**
 * File Model
 * 
 * MongoDB schema for tracking file uploads.
 * Supports two-phase commit pattern for atomic file operations.
 * Tracks file metadata and upload status.
 */

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader user is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['uploading', 'completed', 'failed', 'orphaned'],
      message: 'Status must be uploading, completed, failed, or orphaned'
    },
    default: 'uploading',
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
// Index for finding files by uploader
fileSchema.index({ uploadedBy: 1, createdAt: -1 }, { name: 'idx_uploader_created' });

// Index for finding files by status (for cleanup jobs)
fileSchema.index({ status: 1, createdAt: 1 }, { name: 'idx_status_created' });

// Index for finding files by item
fileSchema.index({ itemId: 1 }, { name: 'idx_item_file' });

// Index for orphaned file cleanup (files older than 24 hours with 'uploading' status)
fileSchema.index({ 
  status: 1, 
  createdAt: 1 
}, { 
  name: 'idx_orphaned_cleanup',
  partialFilterExpression: { status: 'uploading' }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;

