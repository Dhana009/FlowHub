/**
 * BulkJob Model
 * 
 * MongoDB schema for tracking bulk operations.
 * Designed for lazy processing in serverless environments.
 * Flow 7 - Bulk Operations
 */

const mongoose = require('mongoose');

const bulkJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  operation: {
    type: String,
    required: true,
    enum: ['delete', 'activate', 'deactivate']
  },
  itemIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  inProgressIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  processedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  failedItems: [{
    id: mongoose.Schema.Types.ObjectId,
    error: String
  }],
  skippedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
    index: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate progress
bulkJobSchema.pre('save', function(next) {
  if (this.totalItems > 0) {
    const processedCount = this.processedIds.length + this.failedItems.length;
    const skippedCount = this.skippedIds ? this.skippedIds.length : 0;
    
    // Progress calculation: (Actually Processed + Already Correct) / Total
    const totalDone = processedCount + skippedCount;
    this.progress = Math.round((totalDone / this.totalItems) * 100);
    
    if (totalDone >= this.totalItems) {
      this.status = 'completed';
    } else if (totalDone > 0 && this.status === 'pending') {
      this.status = 'processing';
    }
  }
  next();
});

const BulkJob = mongoose.model('BulkJob', bulkJobSchema);

module.exports = BulkJob;

