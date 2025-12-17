/**
 * ActivityLog Model
 * 
 * MongoDB schema for auditing system actions.
 * Used for observability and automated audit trail verification.
 * Flow 9 - Activity Logs
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'ITEM_CREATED',
      'ITEM_UPDATED',
      'ITEM_DEACTIVATED',
      'ITEM_ACTIVATED',
      'BULK_OP_STARTED',
      'BULK_OP_COMPLETED'
    ],
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['USER', 'ITEM', 'BULK_JOB'],
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// Indexes for performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

