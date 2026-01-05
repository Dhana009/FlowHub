/**
 * Internal Service (Automation Hooks)
 * 
 * Provides utility methods for high-scale automation.
 * ONLY FOR USE IN DEVELOPMENT MODE.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const OTP = require('../models/OTP');
const BulkJob = require('../models/BulkJob');
const ActivityLog = require('../models/ActivityLog');
const fileService = require('./fileService');

/**
 * Safely abort and end a MongoDB session
 * Handles cases where transaction is in invalid state
 * 
 * @param {object} session - MongoDB session object
 */
async function safeEndSession(session) {
  if (!session) return;
  
  try {
    // Only abort if transaction is actually in progress
    if (session.inTransaction && session.inTransaction()) {
      await session.abortTransaction();
    }
  } catch (abortError) {
    // Transaction might already be aborted or in invalid state
    // This is expected in error recovery scenarios
    console.warn('Transaction abort failed (expected in error recovery):', abortError.message);
  }
  
  try {
    await session.endSession();
  } catch (endError) {
    console.warn('Session end failed:', endError.message);
  }
}

/**
 * Total Reset: Wipes all collections for a clean test start.
 */
async function resetDatabase() {
  // Wiping all relevant collections
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    OTP.deleteMany({}),
    BulkJob.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);

  return { message: 'Database wiped successfully' };
}

/**
 * Fetch the latest OTP for an email.
 * Prevents tests from needing to "read the console".
 */
async function getLatestOTP(email) {
  if (!email) throw new Error('Email is required');

  const otpRecord = await OTP.findOne({ 
    email: email.toLowerCase(),
    isUsed: false 
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error(`No active OTP found for ${email}`);
  }

  return {
    email: otpRecord.email,
    otp: otpRecord.otpPlain,
    type: otpRecord.type,
    expiresAt: otpRecord.expiresAt
  };
}

/**
 * Fast Seeding: Injects multiple items instantly.
 */
async function seedItems(userId, count = 10) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const items = [];
  const categories = ['Electronics', 'Home', 'Books', 'Fashion'];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const name = `Auto Item ${Date.now()} ${i}`;
    
    // Manually calculate normalization for speed (bypassing pre-save hooks for bulk insert)
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedCategory = category.trim().replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    items.push({
      name,
      normalizedName,
      normalizedNamePrefix: normalizedName.substring(0, 5),
      description: `Automated test item ${i} for scale testing.`,
      item_type: 'DIGITAL',
      price: 10 + i,
      category,
      normalizedCategory,
      download_url: 'https://example.com/test',
      file_size: 1024,
      created_by: userId,
      is_active: true,
      version: 1
    });
  }

  // Use insertMany for high speed
  const result = await Item.insertMany(items);
  return {
    message: `Successfully seeded ${result.length} items`,
    count: result.length
  };
}

/**
 * Cleanup all data for a specific user (hard delete)
 * Deletes Items, BulkJobs, ActivityLogs, OTPs while preserving User record
 * Also deletes associated files from filesystem
 * 
 * @param {string} userId - User ID whose data should be deleted
 * @param {object} options - Cleanup options
 * @param {boolean} options.include_otp - Whether to delete OTPs (default: true)
 * @param {boolean} options.include_activity_logs - Whether to delete activity logs (default: true)
 * @returns {Promise<object>} Deletion counts
 * @throws {Error} - If user not found or deletion fails
 */
async function cleanupUserData(userId, options = {}) {
  const { include_otp = true, include_activity_logs = true } = options;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Collect file paths before deletion (for file cleanup)
  const items = await Item.find({ created_by: userId });
  const filePaths = items
    .filter(item => item.file_path)
    .map(item => item.file_path);

  // Start MongoDB transaction for atomicity
  // Note: If transactions aren't supported (e.g., MongoDB Memory Server), 
  // we'll execute without transaction (still works, just not atomic)
  // We try transactions first, and if they fail, we retry without them
  let session = null;
  let useTransaction = false;

  // Try to use transactions first (if supported)
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (error) {
    // Transactions not supported at session start - proceed without transaction
    useTransaction = false;
    if (session) {
      session.endSession().catch(() => {});
      session = null;
    }
  }

  try {
    // Delete collections in parallel (with or without transaction)
    const sessionOption = useTransaction ? { session } : {};
    
    const deletePromises = [
      Item.deleteMany({ created_by: userId }, sessionOption),
      BulkJob.deleteMany({ userId: userId }, sessionOption)
    ];

    if (include_activity_logs) {
      deletePromises.push(ActivityLog.deleteMany({ userId: userId }, sessionOption));
    }

    if (include_otp) {
      deletePromises.push(OTP.deleteMany({ email: user.email.toLowerCase() }, sessionOption));
    }

    // Execute all deletions in parallel
    const results = await Promise.all(deletePromises);

    // Extract deletion counts (order: items, bulkJobs, activityLogs?, otps?)
    let resultIndex = 0;
    const itemsDeleted = results[resultIndex++].deletedCount;
    const bulkJobsDeleted = results[resultIndex++].deletedCount;
    const activityLogsDeleted = include_activity_logs ? results[resultIndex++].deletedCount : 0;
    const otpsDeleted = include_otp ? results[resultIndex++].deletedCount : 0;

    // Commit transaction if used
    if (useTransaction) {
      await session.commitTransaction();
    }

    // Delete files (best-effort, don't fail if file missing)
    // Only count files that actually existed and were deleted
    let filesDeleted = 0;
    for (const filePath of filePaths) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
          ? filePath 
          : path.join(process.cwd(), filePath);
        
        // Check if file exists before trying to delete
        try {
          await fs.access(fullPath);
          // File exists, try to delete it
          await fileService.deleteFile(filePath);
          filesDeleted++;
        } catch (accessError) {
          // File doesn't exist, skip it (don't count)
          // This is expected for non-existent files
        }
      } catch (error) {
        // Log but don't fail - file might already be deleted
        console.warn(`Failed to delete file ${filePath}:`, error.message);
      }
    }

    return {
      items: itemsDeleted,
      files: filesDeleted,
      bulk_jobs: bulkJobsDeleted,
      activity_logs: activityLogsDeleted,
      otps: otpsDeleted
    };

  } catch (error) {
    // If transaction error occurs, retry without transaction
    // This handles cases where transactions aren't supported (e.g., MongoDB Memory Server)
    const isTransactionError = error.message?.includes('Transaction numbers') || 
                               error.message?.includes('does not match any in-progress transactions') ||
                               error.message?.includes('replica set') ||
                               error.message?.includes('mongos') ||
                               (error.name === 'MongoServerError' && error.message?.includes('Transaction'));
    
    if (isTransactionError) {
      // Clean up session
      await safeEndSession(session);
      session = null;
      
      // Retry without transaction (respecting the same flags)
      const retryDeletePromises = [
        Item.deleteMany({ created_by: userId }),
        BulkJob.deleteMany({ userId: userId })
      ];

      if (include_activity_logs) {
        retryDeletePromises.push(ActivityLog.deleteMany({ userId: userId }));
      }

      if (include_otp) {
        retryDeletePromises.push(OTP.deleteMany({ email: user.email.toLowerCase() }));
      }

      const retryResults = await Promise.all(retryDeletePromises);

      // Extract deletion counts from retry
      let retryResultIndex = 0;
      const itemsDeleted = retryResults[retryResultIndex++].deletedCount;
      const bulkJobsDeleted = retryResults[retryResultIndex++].deletedCount;
      const activityLogsDeleted = include_activity_logs ? retryResults[retryResultIndex++].deletedCount : 0;
      const otpsDeleted = include_otp ? retryResults[retryResultIndex++].deletedCount : 0;

      // Delete files (best-effort, don't fail if file missing)
      // Only count files that actually existed and were deleted
      let filesDeleted = 0;
      for (const filePath of filePaths) {
        try {
          const fs = require('fs').promises;
          const path = require('path');
          const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
            ? filePath 
            : path.join(process.cwd(), filePath);
          
          // Check if file exists before trying to delete
          try {
            await fs.access(fullPath);
            // File exists, try to delete it
            await fileService.deleteFile(filePath);
            filesDeleted++;
          } catch (accessError) {
            // File doesn't exist, skip it (don't count)
            // This is expected for non-existent files
          }
        } catch (fileError) {
          // Log but don't fail - file might already be deleted
          console.warn(`Failed to delete file ${filePath}:`, fileError.message);
        }
      }

      return {
        items: itemsDeleted,
        files: filesDeleted,
        bulk_jobs: bulkJobsDeleted,
        activity_logs: activityLogsDeleted,
        otps: otpsDeleted
      };
    }
    
    // Rollback transaction on error (if transaction was used)
    if (useTransaction && session) {
      await session.abortTransaction().catch(() => {}); // Ignore abort errors
    }
    throw error;
  } finally {
    // End session if it was created
    if (session) {
      session.endSession().catch(() => {}); // Ignore session end errors
    }
  }
}

/**
 * Cleanup only items for a specific user (hard delete)
 * Deletes Items and associated files while preserving all other user data
 * 
 * @param {string} userId - User ID whose items should be deleted
 * @returns {Promise<object>} Deletion counts
 * @throws {Error} - If user not found or deletion fails
 */
async function cleanupUserItems(userId) {
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Collect file paths before deletion (for file cleanup)
  const items = await Item.find({ created_by: userId });
  const filePaths = items
    .filter(item => item.file_path)
    .map(item => item.file_path);

  // Start MongoDB transaction for atomicity
  // Note: If transactions aren't supported (e.g., MongoDB Memory Server), 
  // we'll execute without transaction (still works, just not atomic)
  let session = null;
  let useTransaction = false;

  // Try to use transactions first (if supported)
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (error) {
    // Transactions not supported at session start - proceed without transaction
    useTransaction = false;
    if (session) {
      session.endSession().catch(() => {});
      session = null;
    }
  }

  try {
    // Delete only items (with or without transaction)
    const sessionOption = useTransaction ? { session } : {};
    const itemsResult = await Item.deleteMany({ created_by: userId }, sessionOption);

    // Commit transaction if used
    if (useTransaction) {
      await session.commitTransaction();
    }

    // Delete files (best-effort, don't fail if file missing)
    // Only count files that actually existed and were deleted
    let filesDeleted = 0;
    for (const filePath of filePaths) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
          ? filePath 
          : path.join(process.cwd(), filePath);
        
        // Check if file exists before trying to delete
        try {
          await fs.access(fullPath);
          // File exists, try to delete it
          await fileService.deleteFile(filePath);
          filesDeleted++;
        } catch (accessError) {
          // File doesn't exist, skip it (don't count)
          // This is expected for non-existent files
        }
      } catch (error) {
        // Log but don't fail - file might already be deleted
        console.warn(`Failed to delete file ${filePath}:`, error.message);
      }
    }

    return {
      items: itemsResult.deletedCount,
      files: filesDeleted
    };

  } catch (error) {
    // If transaction error occurs, retry without transaction
    // This handles cases where transactions aren't supported (e.g., MongoDB Memory Server)
    const isTransactionError = error.message?.includes('Transaction numbers') || 
                               error.message?.includes('does not match any in-progress transactions') ||
                               error.message?.includes('replica set') ||
                               error.message?.includes('mongos') ||
                               (error.name === 'MongoServerError' && error.message?.includes('Transaction'));
    
    if (isTransactionError) {
      // Clean up session
      await safeEndSession(session);
      session = null;
      
      // Retry without transaction
      const itemsResult = await Item.deleteMany({ created_by: userId });

      // Delete files
      let filesDeleted = 0;
      for (const filePath of filePaths) {
        try {
          const fs = require('fs').promises;
          const path = require('path');
          const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
            ? filePath 
            : path.join(process.cwd(), filePath);
          
          // Check if file exists before trying to delete
          try {
            await fs.access(fullPath);
            // File exists, try to delete it
            await fileService.deleteFile(filePath);
            filesDeleted++;
          } catch (accessError) {
            // File doesn't exist, skip it (don't count)
          }
        } catch (fileError) {
          // Log but don't fail
          console.warn(`Failed to delete file ${filePath}:`, fileError.message);
        }
      }

      return {
        items: itemsResult.deletedCount,
        files: filesDeleted
      };
    }
    
    // Rollback transaction on error (if transaction was used)
    if (useTransaction && session) {
      await safeEndSession(session);
      session = null;
    }
    throw error;
  } finally {
    // End session if it was created
    await safeEndSession(session);
  }
}

/**
 * Hard delete a single item by ID
 * Deletes the item and associated file from filesystem
 * 
 * @param {string} itemId - Item ID to delete
 * @returns {Promise<object>} Deletion result with counts
 * @throws {Error} - If item not found or deletion fails
 */
async function hardDeleteItem(itemId) {
  const mongoose = require('mongoose');
  
  // Validate itemId format
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error('Invalid item ID format');
    error.statusCode = 400;
    throw error;
  }

  // Find the item first to get file_path
  const item = await Item.findById(itemId);
  if (!item) {
    const error = new Error('Item not found');
    error.statusCode = 404;
    throw error;
  }

  // Collect file path before deletion
  const filePath = item.file_path;

  // Start MongoDB transaction for atomicity
  // Note: If transactions aren't supported (e.g., MongoDB Memory Server), 
  // we'll execute without transaction (still works, just not atomic)
  let session = null;
  let useTransaction = false;

  // Try to use transactions first (if supported)
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (error) {
    // Transactions not supported at session start - proceed without transaction
    useTransaction = false;
    if (session) {
      session.endSession().catch(() => {});
      session = null;
    }
  }

  try {
    // Delete the item (with or without transaction)
    const sessionOption = useTransaction ? { session } : {};
    const deleteResult = await Item.deleteOne({ _id: itemId }, sessionOption);

    if (deleteResult.deletedCount === 0) {
      // Item was deleted between find and delete (race condition)
      const error = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    // Commit transaction if used
    if (useTransaction) {
      await session.commitTransaction();
    }

    // Delete file (best-effort, don't fail if file missing)
    // Only count files that actually existed and were deleted
    let filesDeleted = 0;
    if (filePath) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
          ? filePath 
          : path.join(process.cwd(), filePath);
        
        // Check if file exists before trying to delete
        try {
          await fs.access(fullPath);
          // File exists, try to delete it
          await fileService.deleteFile(filePath);
          filesDeleted = 1;
        } catch (accessError) {
          // File doesn't exist, skip it (don't count)
          // This is expected for non-existent files
        }
      } catch (error) {
        // Log but don't fail - file might already be deleted
        console.warn(`Failed to delete file ${filePath}:`, error.message);
      }
    }

    return {
      item_deleted: true,
      files_deleted: filesDeleted
    };

  } catch (error) {
    // If transaction error occurs, retry without transaction
    // This handles cases where transactions aren't supported (e.g., MongoDB Memory Server)
    const isTransactionError = error.message?.includes('Transaction numbers') || 
                               error.message?.includes('does not match any in-progress transactions') ||
                               error.message?.includes('replica set') ||
                               error.message?.includes('mongos') ||
                               (error.name === 'MongoServerError' && error.message?.includes('Transaction'));
    
    if (isTransactionError) {
      // Clean up session
      await safeEndSession(session);
      session = null;
      
      // Retry without transaction
      const deleteResult = await Item.deleteOne({ _id: itemId });

      if (deleteResult.deletedCount === 0) {
        const error = new Error('Item not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete file
      let filesDeleted = 0;
      if (filePath) {
        try {
          const fs = require('fs').promises;
          const path = require('path');
          const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
            ? filePath 
            : path.join(process.cwd(), filePath);
          
          // Check if file exists before trying to delete
          try {
            await fs.access(fullPath);
            // File exists, try to delete it
            await fileService.deleteFile(filePath);
            filesDeleted = 1;
          } catch (accessError) {
            // File doesn't exist, skip it (don't count)
          }
        } catch (fileError) {
          // Log but don't fail
          console.warn(`Failed to delete file ${filePath}:`, fileError.message);
        }
      }

      return {
        item_deleted: true,
        files_deleted: filesDeleted
      };
    }
    
    // Rollback transaction on error (if transaction was used)
    if (useTransaction && session) {
      await safeEndSession(session);
      session = null;
    }
    throw error;
  } finally {
    // End session if it was created
    await safeEndSession(session);
  }
}

module.exports = {
  resetDatabase,
  getLatestOTP,
  seedItems,
  cleanupUserData,
  cleanupUserItems,
  hardDeleteItem
};

