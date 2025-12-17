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
 * @param {string} role - User role
 * @param {string} operation - Operation type
 * @param {array} itemIds - Array of item IDs
 * @param {object} payload - Optional data
 * @returns {Promise<object>} - Created job
 */
async function createJob(userId, role, operation, itemIds, payload = {}) {
  // 1. PRE-EXECUTION ANALYSIS: One bulk query to understand current states
  // Admin can access all items, others only their own
  const query = { _id: { $in: itemIds } };
  if (role !== 'ADMIN') {
    query.created_by = userId;
  }
  const items = await Item.find(query);
  
  const toProcessIds = [];
  const skippedIds = [];

  // Identify which IDs were actually found
  const foundIds = new Set(items.map(item => item._id.toString()));

  // 1.1 Handle IDs that were NOT found (IDOR attempts or deleted items)
  // We mark these as skipped so the job can reach completion
  itemIds.forEach(id => {
    if (!foundIds.has(id.toString())) {
      skippedIds.push(id);
    }
  });

  items.forEach(item => {
    let alreadyInState = false;

    // RULE: Cannot update category of inactive items
    if (operation === 'activate' && item.is_active) {
      alreadyInState = true;
    } else if ((operation === 'deactivate' || operation === 'delete') && !item.is_active) {
      alreadyInState = true;
    }

    if (alreadyInState) {
      skippedIds.push(item._id);
    } else {
      toProcessIds.push(item._id);
    }
  });

  // 2. CREATE JOB: Initialize with everything accounted for
  const job = await BulkJob.create({
    userId,
    operation,
    itemIds: toProcessIds,
    skippedIds: skippedIds,
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
 * @param {string} role - User role
 * @returns {Promise<object>} - Updated job
 */
async function processNextBatch(jobId, userId, role) {
  const batchSize = 2;
  
  // 1. GET CURRENT STATE
  const query = { _id: jobId };
  if (role !== 'ADMIN') {
    query.userId = userId;
  }
  let job = await BulkJob.findOne(query);
  if (!job || job.status === 'completed') return job;

  // Calculate current progress metrics
  const doneCount = job.processedIds.length + job.failedItems.length + job.skippedIds.length;
  
  // SELF-HEALING: If all items are accounted for in result arrays, we are DONE
  if (doneCount >= job.totalItems) {
    return await BulkJob.findOneAndUpdate(
      { _id: jobId, status: { $ne: 'completed' } },
      { 
        $set: { 
          status: 'completed',
          progress: 100,
          inProgressIds: [] // Clear any zombies
        } 
      },
      { new: true }
    );
  }

  // 2. FIND AVAILABLE ITEMS (Not done and not currently in progress)
  const finishedOrActive = new Set([
    ...job.processedIds.map(id => id.toString()),
    ...job.failedItems.map(f => f.id.toString()),
    ...job.skippedIds.map(id => id.toString()),
    ...job.inProgressIds.map(id => id.toString())
  ]);

  let batchToClaim = job.itemIds
    .filter(id => !finishedOrActive.has(id.toString()))
    .slice(0, batchSize);

  // STALE RECOVERY: If no "fresh" items but job isn't done, 
  // it means items are stuck in inProgressIds. 
  // If the job hasn't been updated in 10 seconds, reclaim one zombie.
  if (batchToClaim.length === 0 && job.inProgressIds.length > 0) {
    const lastUpdate = new Date(job.updatedAt).getTime();
    const now = Date.now();
    if (now - lastUpdate > 10000) { // 10 seconds stale
      batchToClaim = [job.inProgressIds[0]];
      // Remove it from inProgress first so we can re-claim it atomically
      await BulkJob.updateOne({ _id: jobId }, { $pull: { inProgressIds: batchToClaim[0] } });
    }
  }

  if (batchToClaim.length === 0) return job;

  // 3. ATOMIC CLAIM
  const claimQuery = { 
    _id: jobId, 
    inProgressIds: { $nin: batchToClaim }
  };
  if (role !== 'ADMIN') {
    claimQuery.userId = userId;
  }

  job = await BulkJob.findOneAndUpdate(
    claimQuery,
    { 
      $addToSet: { inProgressIds: { $each: batchToClaim } },
      $set: { status: 'processing' }
    },
    { new: true }
  );

  if (!job) return await BulkJob.findOne(query);

  // 4. PROCESS BATCH
  for (const itemId of batchToClaim) {
    try {
      const item = await Item.findById(itemId);
      if (!item) throw new Error('NOT_FOUND');

      let alreadyMatches = false;
      if (job.operation === 'activate' && item.is_active) alreadyMatches = true;
      if ((job.operation === 'deactivate' || job.operation === 'delete') && !item.is_active) alreadyMatches = true;

      if (!alreadyMatches) {
        if (job.operation === 'delete' || job.operation === 'deactivate') {
          // Pass ADMIN role to item service to bypass ownership
          await itemService.deleteItem(itemId.toString(), userId, role);
        } else if (job.operation === 'activate') {
          // Pass ADMIN role to item service to bypass ownership
          await itemService.activateItem(itemId.toString(), userId, role);
        }
      }

      // Success: Atomic move + Progress calc
      const updatedJob = await BulkJob.findOneAndUpdate(
        { _id: jobId },
        { 
          $addToSet: { processedIds: itemId },
          $pull: { inProgressIds: itemId }
        },
        { new: true }
      );
      
      // Manually trigger progress calc since updateOne doesn't
      const newDone = updatedJob.processedIds.length + updatedJob.failedItems.length + updatedJob.skippedIds.length;
      await BulkJob.updateOne({ _id: jobId }, { $set: { progress: Math.round((newDone / job.totalItems) * 100) } });

    } catch (error) {
      const isSkip = (error.code === 11000 || error.statusCode === 409 || error.message === 'ITEM_INACTIVE');
      const updateQuery = isSkip 
        ? { $addToSet: { skippedIds: itemId }, $pull: { inProgressIds: itemId } }
        : { $push: { failedItems: { id: itemId, error: error.message } }, $pull: { inProgressIds: itemId } };

      const updatedJob = await BulkJob.findOneAndUpdate({ _id: jobId }, updateQuery, { new: true });
      const newDone = updatedJob.processedIds.length + updatedJob.failedItems.length + updatedJob.skippedIds.length;
      await BulkJob.updateOne({ _id: jobId }, { $set: { progress: Math.round((newDone / job.totalItems) * 100) } });
    }
  }

  return await BulkJob.findOne(query);
}

/**
 * Get job by ID
 * 
 * @param {string} jobId - Job ID
 * @param {string} userId - User ID
 * @param {string} role - User role
 */
async function getJobById(jobId, userId, role) {
  const query = { _id: jobId };
  if (role !== 'ADMIN') {
    query.userId = userId;
  }
  return await BulkJob.findOne(query);
}

module.exports = {
  createJob,
  processNextBatch,
  getJobById
};

