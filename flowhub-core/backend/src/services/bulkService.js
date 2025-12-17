/**
 * Bulk Service
 * 
 * Business logic for bulk operations.
 * Implements "Lazy Processing" for serverless compatibility.
 * Flow 7 - Bulk Operations
 */

const BulkJob = require('../models/BulkJob');
const Item = require('../models/Item');
const itemService = require('./itemService');

/**
 * Create a new bulk job
 * 
 * @param {string} userId - User ID
 * @param {string} operation - Operation type
 * @param {array} itemIds - Array of item IDs
 * @param {object} payload - Optional data
 * @returns {Promise<object>} - Created job
 */
async function createJob(userId, operation, itemIds, payload = {}) {
  // 1. PRE-EXECUTION ANALYSIS: One bulk query to understand current states
  const items = await Item.find({ _id: { $in: itemIds }, created_by: userId });
  
  const toProcessIds = [];
  const skippedIds = [];

  items.forEach(item => {
    let alreadyInState = false;

    if (operation === 'activate' && item.is_active) {
      alreadyInState = true;
    } else if ((operation === 'deactivate' || operation === 'delete') && !item.is_active) {
      alreadyInState = true;
    } else if (operation === 'update_category' && item.category === payload.category) {
      alreadyInState = true;
    }

    if (alreadyInState) {
      skippedIds.push(item._id);
    } else {
      toProcessIds.push(item._id);
    }
  });

  // 2. CREATE JOB: Initialize with skipped items already accounted for
  const job = await BulkJob.create({
    userId,
    operation,
    itemIds: toProcessIds, // Only work on what's necessary
    skippedIds: skippedIds, // Acknowledge what's already done
    payload,
    totalItems: itemIds.length,
    status: toProcessIds.length === 0 ? 'completed' : 'pending'
  });

  return job;
}

/**
 * Process the next batch of items for a job
 * Implements "Lazy Processing" - processes 2 items per call
 * 
 * @param {string} jobId - Job ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<object>} - Updated job
 */
async function processNextBatch(jobId, userId) {
  const batchSize = 2;
  
  const jobState = await BulkJob.findOne({ _id: jobId, userId });
  if (!jobState || jobState.status === 'completed') return jobState;

  // Filter out items that are already finished or in progress
  const finishedSet = new Set([
    ...jobState.processedIds.map(id => id.toString()),
    ...jobState.failedItems.map(f => f.id.toString()),
    ...jobState.inProgressIds.map(id => id.toString())
  ]);

  const availableIds = jobState.itemIds
    .filter(id => !finishedSet.has(id.toString()))
    .slice(0, batchSize);

  if (availableIds.length === 0) {
    // Check if we are truly done (nothing left in progress)
    if (jobState.inProgressIds.length === 0) {
      jobState.status = 'completed';
      await jobState.save();
    }
    return jobState;
  }

  // Atomically claim the items
  const job = await BulkJob.findOneAndUpdate(
    { _id: jobId, userId },
    { $addToSet: { inProgressIds: { $each: availableIds } } },
    { new: true }
  );

  for (const itemId of availableIds) {
    let retryCount = 0;
    const MAX_ITEM_RETRIES = 2;
    let processed = false;

    while (retryCount <= MAX_ITEM_RETRIES && !processed) {
      try {
        if (job.operation === 'delete' || job.operation === 'deactivate') {
          await itemService.deleteItem(itemId.toString(), userId);
        } else if (job.operation === 'activate') {
          await itemService.activateItem(itemId.toString(), userId);
        } else if (job.operation === 'update_category') {
          const item = await Item.findById(itemId);
          if (!item) throw new Error('Item not found');
          
          if (!item.is_active || item.deleted_at) {
            const jobToUpdate = await BulkJob.findById(jobId);
            if (jobToUpdate) {
              jobToUpdate.failedItems.push({ id: itemId, error: 'Skipped: Cannot update inactive item' });
              jobToUpdate.inProgressIds.pull(itemId);
              await jobToUpdate.save();
            }
            processed = true;
            continue;
          }

          await itemService.updateItem(
            itemId.toString(), 
            { category: job.payload.category }, 
            null, 
            userId, 
            parseInt(item.version, 10)
          );
        }
        processed = true;
      } catch (error) {
        const errorCode = error.errorCodeDetail || '';
        if (errorCode === 'VERSION_CONFLICT' && retryCount < MAX_ITEM_RETRIES) {
          retryCount++;
          await new Promise(r => setTimeout(r, 100 * retryCount));
          continue;
        }
        
        const jobToUpdate = await BulkJob.findById(jobId);
        if (jobToUpdate) {
          jobToUpdate.failedItems.push({ id: itemId, error: error.message?.substring(0, 50) || 'Failed' });
          jobToUpdate.inProgressIds.pull(itemId);
          await jobToUpdate.save();
        }
        processed = true;
      }
    }

    if (processed) {
      // 3. UPDATE PROGRESS: We use findById + save() to trigger the pre-save hook
      const jobToUpdate = await BulkJob.findById(jobId);
      if (jobToUpdate) {
        const wasFailed = jobToUpdate.failedItems.some(f => f.id.toString() === itemId.toString());
        if (!wasFailed) {
          // Add to processedIds and remove from inProgressIds
          jobToUpdate.processedIds.addToSet(itemId);
          jobToUpdate.inProgressIds.pull(itemId);
          await jobToUpdate.save(); // This triggers the progress calculation hook
        }
      }
    }
  }

  return await BulkJob.findById(jobId);
}

/**
 * Get job by ID
 */
async function getJobById(jobId, userId) {
  return await BulkJob.findOne({ _id: jobId, userId });
}

module.exports = {
  createJob,
  processNextBatch,
  getJobById
};

