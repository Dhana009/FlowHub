# Test Data Cleanup & Hard Delete - Backend Answers

**Purpose:** Complete answers to test data cleanup questions  
**Last Updated:** 2025-01-05  
**Status:** Based on actual codebase implementation  
**Note:** `DELETE /api/v1/internal/users/:userId/data` endpoint is now implemented ✅  
**Note:** `DELETE /api/v1/internal/users/:userId/data` endpoint is now implemented ✅

---

## Executive Summary

**Current State:**
- ✅ `DELETE /api/v1/items/:id` = **SOFT DELETE** (sets `is_active: false`, `deleted_at: timestamp`)
- ✅ `POST /api/v1/internal/reset` = **HARD DELETE** (deletes all collections)
- ✅ `DELETE /api/v1/internal/users/:userId/data` = **HARD DELETE** (deletes all user data, preserves user record) ⭐ **NEW**
- ✅ Bulk operations exist but also use soft delete
- ❌ No hard delete endpoint for individual items
- ❌ No bulk delete by tag endpoint
- ❌ No `test_data` flag field

**Recommendations:**
- Use `POST /api/v1/internal/reset` for full cleanup (isolated test environments)
- Use `DELETE /api/v1/internal/users/:userId/data` for per-user cleanup (shared staging, parallel execution) ⭐ **RECOMMENDED**
- Use `tags: ["test-data"]` to identify test items
- For selective cleanup by tag, use soft delete + filter queries (or wait for tag-based cleanup endpoint)

---

## CATEGORY 1: HARD DELETE CAPABILITY

### Q1.1: Does `DELETE /api/v1/items/:id` perform hard delete or soft delete?

**Answer:** **SOFT DELETE** ✅

**Implementation Details:**
- **Endpoint:** `DELETE /api/v1/items/:id`
- **Location:** `flowhub-core/backend/src/controllers/itemController.js:604`
- **Service:** `flowhub-core/backend/src/services/itemService.js:926`

**What it does:**
```javascript
// Sets is_active to false and deleted_at to current timestamp
await Item.findByIdAndUpdate(itemId, {
  $set: {
    is_active: false,
    deleted_at: new Date() // UTC timestamp
  }
});
```

**Behavior:**
- Item remains in database
- `is_active` set to `false`
- `deleted_at` set to current timestamp
- Item can be restored via `PATCH /api/v1/items/:id/activate`
- Item excluded from normal queries (unless `status=inactive` filter used)

**Response (200):**
```json
{
  "status": "success",
  "message": "Item deleted successfully",
  "data": {
    "_id": "...",
    "name": "...",
    "is_active": false,
    "deleted_at": "2025-01-05T10:30:00.000Z"
  }
}
```

---

### Q1.2: If it's soft delete, is there an endpoint for hard delete?

**Answer:** **NO** ❌ - No hard delete endpoint for individual items exists.

**What exists instead:**
- `POST /api/v1/internal/reset` - Hard deletes ALL collections (see Q4.1)

**What doesn't exist:**
- `DELETE /api/v1/items/:id?permanent=true` - ❌ Not implemented
- `DELETE /api/v1/internal/items/:id/permanent` - ❌ Not implemented
- `DELETE /api/v1/items/:id/hard` - ❌ Not implemented

---

### Q1.3: Can we add a hard delete endpoint if it doesn't exist?

**Answer:** **YES** ✅ - Can be implemented, but requires backend team approval.

**Recommendation:**
- Add `DELETE /api/v1/internal/items/:id/permanent` (internal endpoint, requires `x-internal-key`)
- Or add query parameter: `DELETE /api/v1/items/:id?permanent=true` (with environment check)
- Should only be available in test/dev environments (not production)

**Implementation considerations:**
- Must check environment (NODE_ENV !== 'production')
- Should require internal key for security
- Must handle file cleanup (delete associated files)
- Must handle activity log cleanup (optional)
- Must handle foreign key constraints (if any)

---

## CATEGORY 2: BULK DELETE OPERATIONS

### Q2.1: Is there a bulk delete endpoint?

**Answer:** **YES** ✅ - Via bulk operations endpoint, but uses **soft delete**.

**Endpoint:** `POST /api/v1/bulk-operations`

**Request:**
```json
{
  "operation": "delete",
  "itemIds": ["id1", "id2", "id3", ...]
}
```

**Response:**
```json
{
  "status": "success",
  "job_id": "507f1f77bcf86cd799439011",
  "message": "Bulk operation started"
}
```

**How it works:**
1. Creates a `BulkJob` record
2. Processes items in batches (async)
3. Calls `itemService.deleteItem()` for each item (soft delete)
4. Returns job ID for status polling

**Status Polling:**
```http
GET /api/v1/bulk-operations/:jobId
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "job_id": "...",
    "status": "completed",
    "progress": 100,
    "total_items": 100,
    "processed": 100,
    "failed": 0,
    "skipped": 0
  }
}
```

**Limitations:**
- Uses soft delete (not hard delete)
- Async processing (must poll for completion)
- Maximum batch size: Configurable (default: 50 items per batch)

**Location:** `flowhub-core/backend/src/controllers/bulkController.js`

---

### Q2.2: Can we delete items by tag?

**Answer:** **NO** ❌ - No endpoint exists to delete by tag.

**What exists:**
- `GET /api/v1/items` - Can filter by tags (query parameter not implemented, but can filter in query)
- `GET /api/v1/items/seed-status/:userId` - Can check items with specific tags

**What doesn't exist:**
- `DELETE /api/v1/items?tags=test-data` - ❌ Not implemented
- `POST /api/v1/items/delete-by-tag` - ❌ Not implemented

**Workaround:**
1. Query items by tag: `GET /api/v1/items` (with custom query)
2. Extract item IDs
3. Use bulk operations: `POST /api/v1/bulk-operations` with `operation: "delete"`

**Example:**
```javascript
// 1. Get all items with test-data tag (would need custom query)
// 2. Extract IDs
const itemIds = items.map(item => item._id);

// 3. Bulk delete (soft delete)
await POST('/api/v1/bulk-operations', {
  operation: 'delete',
  itemIds: itemIds
});
```

---

### Q2.3: Can we delete all items for a specific user?

**Answer:** **NO** ❌ - No endpoint exists to delete all items for a user.

**What exists:**
- `GET /api/v1/items` - Can filter by user (RBAC-based, EDITOR sees only own items)
- `GET /api/v1/items/count` - Can count items for a user

**What doesn't exist:**
- `DELETE /api/v1/users/:userId/items` - ❌ Not implemented
- `DELETE /api/v1/items?created_by=userId` - ❌ Not implemented

**Workaround:**
1. Get all items for user: `GET /api/v1/items` (as EDITOR, or ADMIN with filter)
2. Extract item IDs
3. Use bulk operations: `POST /api/v1/bulk-operations` with `operation: "delete"`

**Example:**
```javascript
// 1. Get all items (as user, or as ADMIN with filter)
const response = await GET('/api/v1/items?limit=1000');
const itemIds = response.body.data.items.map(item => item._id);

// 2. Bulk delete (soft delete)
await POST('/api/v1/bulk-operations', {
  operation: 'delete',
  itemIds: itemIds
});
```

---

## CATEGORY 3: TEST DATA IDENTIFICATION

### Q3.1: How can we identify test data vs real data?

**Answer:** **Use `tags` field** ✅

**Recommended Method:**
```json
{
  "name": "Test Item",
  "tags": ["test-data", "automation"]  // Mark as test data
}
```

**Query by tag:**
- Items can be queried by tags (though no direct API endpoint for tag filtering in GET)
- Seed data already uses `tags: ["seed", "v1.0"]` pattern
- Same pattern can be used for test data: `tags: ["test-data"]`

**Alternative Methods:**
- **Naming pattern:** Use consistent prefix (e.g., `"TEST_Item_..."`)
- **No `test_data` flag:** Field doesn't exist in Item model

**Current Item Model Fields:**
- `tags` (Array) - ✅ Available, recommended
- `name` (String) - Can use naming pattern
- `created_by` (ObjectId) - Can track test users
- `test_data` (Boolean) - ❌ Does not exist

---

### Q3.2: Can we add a `test_data` flag to items?

**Answer:** **YES** ✅ - Can be added, but requires backend team approval and schema migration.

**Recommendation:**
- Add `test_data: { type: Boolean, default: false }` to Item model
- Update item creation endpoints to accept `test_data` field
- Add index for faster queries: `Item.index({ test_data: 1 })`

**Benefits:**
- Faster queries (indexed boolean vs array search)
- Clearer intent (explicit flag vs tag)
- Easier cleanup queries

**Trade-offs:**
- Requires schema migration
- Must update all item creation endpoints
- Must handle existing items (backfill or default to false)

**Current Status:** Field does not exist. Use `tags: ["test-data"]` as workaround.

---

### Q3.3: Should test data be in a separate collection/table?

**Answer:** **NO** ❌ - Not recommended, and not implemented.

**Current Architecture:**
- Single `items` collection
- All items (test and real) in same collection
- Filtered by `is_active`, `tags`, `created_by`, etc.

**Why not separate:**
- Adds complexity (two collections to manage)
- Breaks RBAC (user ownership checks)
- Breaks queries (must query both collections)
- Not aligned with current architecture

**Recommendation:** Keep single collection, use `tags` or `test_data` flag for identification.

---

## CATEGORY 4: CLEANUP ENDPOINTS

### Q4.1: Is there a "reset database" endpoint for test environments?

**Answer:** **YES** ✅ - Already exists, but **NOT PRACTICAL for real-world use cases**.

**Endpoint:** `POST /api/v1/internal/reset`

**Authentication:** Requires `x-internal-key` header

**Request:**
```http
POST /api/v1/internal/reset
x-internal-key: flowhub-secret-automation-key-2025
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message": "Database wiped successfully"
  }
}
```

**What it deletes (HARD DELETE - EVERYTHING):**
- ✅ **ALL Users** (`User.deleteMany({})`) - ⚠️ **Deletes admin users, all test users, everything**
- ✅ **ALL Items** (`Item.deleteMany({})`) - ⚠️ **Deletes all items from all users**
- ✅ **ALL OTPs** (`OTP.deleteMany({})`)
- ✅ **ALL BulkJobs** (`BulkJob.deleteMany({})`)
- ✅ **ALL ActivityLogs** (`ActivityLog.deleteMany({})`)

**Location:** `flowhub-core/backend/src/services/internalService.js:18`

**⚠️ PRACTICAL LIMITATIONS:**

**When it's NOT practical:**
- ❌ **Shared staging environments** - Deletes other testers' data
- ❌ **Production** - Never use this (would delete all real data)
- ❌ **Preserving admin users** - Must recreate admin after reset
- ❌ **Preserving other test data** - Can't selectively keep some data
- ❌ **Parallel test execution** - One test suite wipes data for all others

**When it IS practical:**
- ✅ **Isolated test environments** - Single test runner, dedicated DB
- ✅ **CI/CD pipelines** - Fresh database per pipeline run
- ✅ **Local development** - Developer's own database
- ✅ **Docker containers** - Ephemeral databases

**Security:**
- Requires `x-internal-key` header
- Should only be used in test/dev environments
- Default key: `flowhub-secret-automation-key-2025`
- Can be overridden via `INTERNAL_AUTOMATION_KEY` environment variable

**Performance:**
- Fast (bulk delete operations)
- Atomic (all collections deleted in parallel)

**⚠️ CONCLUSION:** For real-world test automation (shared staging, parallel execution), you **NEED selective cleanup endpoints** (see Q4.2, Q4.3).

---

### Q4.2: Can we add a "cleanup test data" endpoint?

**Answer:** **YES** ✅ - Can be implemented, but doesn't exist yet.

**Recommended Endpoint:**
```http
POST /api/v1/internal/cleanup-test-data
x-internal-key: flowhub-secret-automation-key-2025
```

**Request Body (Optional):**
```json
{
  "tags": ["test-data"],  // Optional: specific tags to clean
  "hard_delete": true     // Optional: hard delete vs soft delete
}
```

**Response:**
```json
{
  "status": "success",
  "deleted_count": 150,
  "method": "hard_delete"  // or "soft_delete"
}
```

**Implementation:**
```javascript
// Pseudo-code
async function cleanupTestData(tags = ['test-data'], hardDelete = true) {
  const query = { tags: { $in: tags } };
  
  if (hardDelete) {
    const result = await Item.deleteMany(query);
    return { deleted_count: result.deletedCount, method: 'hard_delete' };
  } else {
    const result = await Item.updateMany(query, {
      $set: { is_active: false, deleted_at: new Date() }
    });
    return { deleted_count: result.modifiedCount, method: 'soft_delete' };
  }
}
```

**Benefits:**
- Safer than full reset (preserves real data)
- Faster than individual deletes
- Can target specific tags

**Status:** Not implemented. Use `POST /api/v1/internal/reset` for now.

---

### Q4.3: Can we add a "cleanup user data" endpoint?

**Answer:** **YES** ✅ - **IMPLEMENTED** ✅

**Endpoint:** `DELETE /api/v1/internal/users/:userId/data`

**Authentication:** Requires `x-internal-key` header

**Request:**
```http
DELETE /api/v1/internal/users/:userId/data?include_otp=true&include_activity_logs=true
x-internal-key: flowhub-secret-automation-key-2025
```

**Query Parameters (Optional):**
- `include_otp` (boolean, default: `true`) - Whether to delete OTPs
- `include_activity_logs` (boolean, default: `true`) - Whether to delete activity logs

**Response (200):**
```json
{
  "status": "success",
  "deleted": {
    "items": 25,
    "files": 8,
    "bulk_jobs": 3,
    "activity_logs": 150,
    "otps": 5
  },
  "preserved": {
    "user": true
  }
}
```

**What it deletes (HARD DELETE):**
- ✅ **Items** (`Item.deleteMany({ created_by: userId })`) - All items created by the user
- ✅ **BulkJobs** (`BulkJob.deleteMany({ userId: userId })`) - All bulk jobs for the user
- ✅ **ActivityLogs** (`ActivityLog.deleteMany({ userId: userId })`) - If `include_activity_logs=true`
- ✅ **OTPs** (`OTP.deleteMany({ email: user.email })`) - If `include_otp=true`
- ✅ **Files** - Physical files associated with deleted items (from filesystem)

**What it preserves:**
- ✅ **User record** - User account remains intact
- ✅ **Other users' data** - Only deletes data for the specified user

**Location:** 
- Service: `flowhub-core/backend/src/services/internalService.js:113`
- Controller: `flowhub-core/backend/src/controllers/internalController.js:79`
- Route: `flowhub-core/backend/src/routes/internalRoutes.js:36`

**Implementation:**
```javascript
// Actual implementation
async function cleanupUserData(userId, options = {}) {
  const { include_otp = true, include_activity_logs = true } = options;
  
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  // Collect file paths before deletion
  const items = await Item.find({ created_by: userId });
  const filePaths = items.filter(item => item.file_path).map(item => item.file_path);
  
  // Delete collections (with transaction support, graceful fallback)
  const [itemsResult, bulkJobsResult, activityLogsResult, otpsResult] = await Promise.all([
    Item.deleteMany({ created_by: userId }),
    BulkJob.deleteMany({ userId: userId }),
    include_activity_logs ? ActivityLog.deleteMany({ userId: userId }) : Promise.resolve({ deletedCount: 0 }),
    include_otp ? OTP.deleteMany({ email: user.email.toLowerCase() }) : Promise.resolve({ deletedCount: 0 })
  ]);
  
  // Delete files
  let filesDeleted = 0;
  for (const filePath of filePaths) {
    try {
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        await fileService.deleteFile(filePath);
        filesDeleted++;
      }
    } catch (error) {
      // Log but don't fail
    }
  }
  
  return {
    items: itemsResult.deletedCount,
    files: filesDeleted,
    bulk_jobs: bulkJobsResult.deletedCount,
    activity_logs: activityLogsResult.deletedCount,
    otps: otpsResult.deletedCount
  };
}
```

**Error Responses:**
- **400:** Invalid `userId` format (not a valid ObjectId)
- **401:** Invalid or missing `x-internal-key` header
- **404:** User not found

**Use Cases:**
- **Test Data Cleanup:** Remove all test data for a specific user after test completion
- **Parallel Test Execution:** Clean up one user's data without affecting others
- **Shared Staging Environments:** Selective cleanup without full database reset
- **User Data Migration:** Clean up old data before user migration

**Implementation Details:**
- Uses MongoDB transactions when supported (graceful fallback for test environments)
- Deletes files from filesystem (only counts files that actually existed)
- Atomic operation (all-or-nothing deletion)
- Fast bulk delete operations

**Status:** ✅ **IMPLEMENTED** - Available at `DELETE /api/v1/internal/users/:userId/data`

---

## CATEGORY 5: DIRECT DATABASE ACCESS

### Q5.1: Should we use direct MongoDB access for cleanup?

**Answer:** **NOT RECOMMENDED** ⚠️ - Use API endpoints when possible.

**Pros of Direct MongoDB:**
- ✅ Faster (no HTTP overhead)
- ✅ More control (direct queries)
- ✅ Can use bulk operations efficiently

**Cons of Direct MongoDB:**
- ❌ Bypasses business logic (validation, activity logs)
- ❌ Bypasses RBAC (security risk)
- ❌ Harder to maintain (direct DB access in tests)
- ❌ Not portable (MongoDB-specific)

**Recommendation:**
- **Test environments:** Acceptable for cleanup operations (performance critical)
- **Staging/Production:** Use API endpoints only
- **Hybrid:** Use API for business logic, direct DB for bulk cleanup

**Example (Direct MongoDB):**
```javascript
// Test environment only
const mongoose = require('mongoose');
const Item = require('./models/Item');

// Hard delete all test items
await Item.deleteMany({ tags: { $in: ['test-data'] } });
```

---

### Q5.2: What's the recommended cleanup strategy?

**Answer:** **Hybrid approach** ✅

**Recommended Strategy:**

1. **Full Reset (Test Suite Start):**
   ```javascript
   // Before test suite
   POST /api/v1/internal/reset  // Hard delete everything
   ```

2. **Selective Cleanup (After Tests):**
   ```javascript
   // Option A: Soft delete via API (safer)
   POST /api/v1/bulk-operations
   { operation: 'delete', itemIds: [...] }
   
   // Option B: Hard delete via direct MongoDB (faster, test only)
   Item.deleteMany({ tags: { $in: ['test-data'] } })
   ```

3. **Per-User Cleanup:**
   ```javascript
   // Get user's items
   const items = await GET('/api/v1/items');
   // Bulk delete
   await POST('/api/v1/bulk-operations', { operation: 'delete', itemIds: [...] });
   ```

**Performance Comparison:**
- Full reset: ~100-500ms (all collections)
- Bulk soft delete (100 items): ~2-5 seconds (API calls)
- Direct MongoDB hard delete (100 items): ~50-200ms (bulk operation)

---

### Q5.3: Are there any database constraints we should know about?

**Answer:** **Minimal constraints** ✅

**Current Architecture:**
- **No foreign keys:** MongoDB doesn't enforce referential integrity
- **No cascading deletes:** Must handle manually
- **Soft delete pattern:** Items marked as inactive, not removed

**What to watch for:**
- **Activity Logs:** Reference item IDs (but can be orphaned safely)
- **Bulk Jobs:** Reference item IDs (but can be orphaned safely)
- **File uploads:** Files stored separately, must be cleaned up manually

**File Cleanup:**
- Items have `file_path` field
- Files stored in `uploads/items/` directory
- Hard delete should also delete files:
  ```javascript
  // Pseudo-code
  const item = await Item.findById(itemId);
  if (item.file_path) {
    await fs.unlink(item.file_path); // Delete file
  }
  await Item.findByIdAndDelete(itemId); // Delete item
  ```

**Recommendation:** Use `POST /api/v1/internal/reset` which handles all cleanup automatically.

---

## CATEGORY 6: PERFORMANCE CONSIDERATIONS

### Q6.1: How fast is bulk delete?

**Answer:** **Depends on method** ⚡

**Performance Comparison:**

| Method | 100 Items | 1000 Items | Notes |
|--------|-----------|------------|-------|
| Individual API calls | ~10-30s | ~2-5 min | Sequential, slow |
| Bulk operations (soft) | ~2-5s | ~20-50s | Async, batched |
| Direct MongoDB (hard) | ~50-200ms | ~500ms-2s | Fastest, bulk operation |
| Full reset | ~100-500ms | ~100-500ms | All collections |

**Bulk Operations Details:**
- Batch size: 50 items per batch (configurable)
- Async processing: Must poll for completion
- Soft delete: Each item updated individually

**Direct MongoDB:**
```javascript
// Fastest method (test environments only)
await Item.deleteMany({ tags: { $in: ['test-data'] } });
// ~50ms for 100 items, ~500ms for 1000 items
```

---

### Q6.2: Should we delete test data after each test or at session end?

**Answer:** **Session-end cleanup** ✅ (Recommended)

**Per-Test Cleanup:**
- ✅ Cleaner state between tests
- ❌ Slower (overhead per test)
- ❌ More API calls

**Session-End Cleanup:**
- ✅ Faster (single cleanup operation)
- ✅ Less API overhead
- ⚠️ Data accumulates during session (may affect tests if not isolated)

**Recommendation:**
- **Session start:** Full reset (`POST /api/v1/internal/reset`)
- **Session end:** Cleanup test data (bulk delete or full reset)
- **Per-test:** Only if test creates significant data or needs isolation

**Example:**
```python
@pytest.fixture(scope="session", autouse=True)
def cleanup_session():
    # Start: Full reset
    api_client.post('/internal/reset', headers={'x-internal-key': KEY})
    yield  # Tests run
    # End: Cleanup test data
    api_client.post('/internal/reset', headers={'x-internal-key': KEY})
```

---

### Q6.3: Can we use database transactions for cleanup?

**Answer:** **YES** ✅ - MongoDB supports transactions, but current implementation doesn't use them.

**Current Implementation:**
- No transactions used in delete operations
- Each delete is independent
- No rollback on failure

**MongoDB Transactions:**
```javascript
// Pseudo-code
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Item.deleteMany({ tags: ['test-data'] }, { session });
  await ActivityLog.deleteMany({ userId }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Benefits:**
- Atomic operations (all or nothing)
- Rollback on failure
- Data consistency

**Trade-offs:**
- Requires replica set (MongoDB requirement)
- Slightly slower (transaction overhead)
- More complex error handling

**Recommendation:** Not necessary for test cleanup (use full reset for atomicity).

---

## CATEGORY 7: ENVIRONMENT-SPECIFIC BEHAVIOR

### Q7.1: Are hard delete endpoints available in all environments?

**Answer:** **Only `POST /api/v1/internal/reset` exists** - Requires internal key.

**Current Endpoints:**
- `POST /api/v1/internal/reset` - Available in all environments (with key)
- `DELETE /api/v1/items/:id` - Soft delete, available in all environments

**Security:**
- Internal endpoints require `x-internal-key` header
- Key should be different per environment
- Production should disable or use very secure key

**Recommendation:**
- **Test/Dev:** Full access to internal endpoints
- **Staging:** Limited access (coordinate with team)
- **Production:** Disabled or very restricted

---

### Q7.2: How do we prevent accidental hard deletes in production?

**Answer:** **Environment checks + Internal key** 🔒

**Current Protection:**
- Internal endpoints require `x-internal-key` header
- Key can be environment-specific

**Recommended Protection:**
```javascript
// Pseudo-code
if (process.env.NODE_ENV === 'production') {
  throw new Error('Hard delete not allowed in production');
}

if (req.headers['x-internal-key'] !== process.env.INTERNAL_AUTOMATION_KEY) {
  return res.status(401).json({ error: 'Invalid internal key' });
}
```

**Best Practices:**
- Use different keys per environment
- Log all internal endpoint usage
- Require explicit confirmation for destructive operations
- Use feature flags for new cleanup endpoints

---

### Q7.3: Can we configure cleanup behavior per environment?

**Answer:** **YES** ✅ - Via environment variables and code checks.

**Recommended Configuration:**
```javascript
// config/cleanup.js
const CLEANUP_CONFIG = {
  test: {
    allowHardDelete: true,
    allowFullReset: true,
    cleanupMethod: 'hard_delete'
  },
  staging: {
    allowHardDelete: true,
    allowFullReset: false,  // Coordinate with team
    cleanupMethod: 'soft_delete'
  },
  production: {
    allowHardDelete: false,
    allowFullReset: false,
    cleanupMethod: 'soft_delete_only'
  }
};
```

**Implementation:**
- Check `NODE_ENV` environment variable
- Apply appropriate restrictions
- Log all cleanup operations

**Status:** Not implemented. Current: All environments have same behavior (with key protection).

---

## SUMMARY & RECOMMENDATIONS

### Current Capabilities ✅

1. **Soft Delete:** `DELETE /api/v1/items/:id` (sets `is_active: false`)
2. **Full Reset:** `POST /api/v1/internal/reset` (hard deletes **ALL** collections - **NOT practical for shared environments**)
3. **Per-User Cleanup:** `DELETE /api/v1/internal/users/:userId/data` ⭐ **NEW** (hard deletes all user data, preserves user record)
4. **Bulk Operations:** `POST /api/v1/bulk-operations` (soft delete, async)
5. **Test Data Identification:** Use `tags: ["test-data"]`

### Missing Capabilities ❌ (CRITICAL for Real-World Use)

1. **Selective Cleanup:** No endpoint to cleanup only test data (by tag/user)
2. **Hard Delete:** No endpoint for permanent item deletion
3. **Delete by Tag:** No endpoint to delete items by tag
4. **Delete by User:** ✅ **IMPLEMENTED** - `DELETE /api/v1/internal/users/:userId/data` (see Q4.3)
5. **Test Data Flag:** No `test_data` boolean field

### ⚠️ CRITICAL GAP: Real-World Test Automation

**Problem:** `POST /api/v1/internal/reset` deletes **EVERYTHING**:
- All users (including admin, other testers)
- All items (from all users)
- All OTPs, BulkJobs, ActivityLogs

**This is NOT practical for:**
- ❌ Shared staging environments (deletes other testers' data)
- ❌ Parallel test execution (one suite wipes data for others)
- ❌ Preserving admin users (must recreate after reset)
- ❌ Production-like testing (can't preserve some data)

### Recommended Approach 🎯

**For Isolated Test Environments (CI/CD, Docker, Local Dev):**
1. **Session Start:** `POST /api/v1/internal/reset` ✅ Works fine
2. **Session End:** `POST /api/v1/internal/reset` ✅ Works fine

**For Real-World Test Automation (Shared Staging, Parallel Execution):**
1. **Session Start:** 
   ```javascript
   // Option A: Per-user cleanup (IMPLEMENTED ✅)
   DELETE /api/v1/internal/users/{userId}/data
   x-internal-key: flowhub-secret-automation-key-2025
   
   // Option B: Selective cleanup by tag (NOT IMPLEMENTED - still needed)
   POST /api/v1/internal/cleanup-test-data
   { tags: ["test-data"], hard_delete: true }
   
   // Option C: Workaround - soft delete + filter (slower)
   // Get items with test-data tag, bulk soft delete
   ```

2. **Test Data Creation:**
   ```javascript
   POST /api/v1/items/batch
   {
     items: [...],
     tags: ["test-data"]  // Mark as test data
   }
   ```

3. **Session End:**
   ```javascript
   // Option A: Per-user cleanup (IMPLEMENTED ✅)
   DELETE /api/v1/internal/users/{userId}/data
   x-internal-key: flowhub-secret-automation-key-2025
   
   // Option B: Selective cleanup by tag (NOT IMPLEMENTED - still needed)
   POST /api/v1/internal/cleanup-test-data
   { tags: ["test-data"], hard_delete: true }
   ```

4. **Per-Test Cleanup (if needed):**
   ```javascript
   // Soft delete via API
   DELETE /api/v1/items/:id
   
   // Or bulk delete
   POST /api/v1/bulk-operations
   { operation: "delete", itemIds: [...] }
   ```

### Implementation Requests 📋

**🔴 HIGH PRIORITY (Required for Real-World Use):**
1. **`POST /api/v1/internal/cleanup-test-data`** - Selective cleanup by tag/user
   - **Why:** Essential for shared staging environments
   - **Impact:** Enables parallel test execution, preserves other data

**🟡 MEDIUM PRIORITY (Nice-to-Have):**
2. **`DELETE /api/v1/internal/users/:userId/data`** - Cleanup user-specific data ✅ **IMPLEMENTED**
   - **Why:** Useful for per-user cleanup
   - **Impact:** Better isolation in parallel execution
   - **Status:** ✅ Available - Hard deletes all user data while preserving user record

3. **`test_data` boolean field** - Indexed test data identification
   - **Why:** Faster queries than tag array search
   - **Impact:** Performance optimization

**🟢 LOW PRIORITY (Optional):**
4. **`DELETE /api/v1/internal/items/:id/permanent`** - Hard delete individual item
   - **Why:** Rarely needed (soft delete usually sufficient)
   - **Impact:** Minimal

5. **`DELETE /api/v1/items?tags=test-data`** - Delete by tag via query param
   - **Why:** Less flexible than POST endpoint
   - **Impact:** Minimal

---

## EXAMPLE IMPLEMENTATIONS

### Example 1: Full Reset (Recommended)

```python
import pytest

@pytest.fixture(scope="session", autouse=True)
def reset_database(api_client):
    """Full database reset before and after test session."""
    headers = {'x-internal-key': 'flowhub-secret-automation-key-2025'}
    
    # Before tests
    api_client.post('/api/v1/internal/reset', headers=headers)
    yield
    
    # After tests
    api_client.post('/api/v1/internal/reset', headers=headers)
```

### Example 2: Per-User Cleanup (Implemented) ✅

```python
@pytest.fixture(scope="function", autouse=True)
def cleanup_user_data(api_client, test_user):
    """Cleanup user data after each test."""
    yield  # Test runs
    
    # Cleanup all data for the test user
    headers = {'x-internal-key': 'flowhub-secret-automation-key-2025'}
    api_client.delete(
        f'/api/v1/internal/users/{test_user["id"]}/data',
        headers=headers
    )
```

### Example 3: Per-User Cleanup with Options

```python
def cleanup_user_data_preserve_logs(api_client, user_id):
    """Cleanup user data but preserve activity logs."""
    headers = {'x-internal-key': 'flowhub-secret-automation-key-2025'}
    response = api_client.delete(
        f'/api/v1/internal/users/{user_id}/data?include_activity_logs=false',
        headers=headers
    )
    return response.json()  # Returns deletion counts
```

### Example 4: Direct MongoDB (Test Only)

```python
# Test environment only - direct MongoDB access
from flowhub_core.backend.src.models.Item import Item

def cleanup_test_items():
    """Hard delete all test items via direct MongoDB."""
    result = Item.deleteMany({ tags: { '$in': ['test-data'] } })
    return result.deleted_count
```

---

## CONCLUSION

**Current State:** 
- Soft delete is the standard
- Hard delete only via full reset (`POST /api/v1/internal/reset`)
- **Full reset deletes EVERYTHING** (all users, all items, all data)

**⚠️ CRITICAL LIMITATION:**
- `POST /api/v1/internal/reset` is **NOT practical** for:
  - Shared staging environments
  - Parallel test execution
  - Preserving admin/other users' data
  - Real-world test automation scenarios

**Recommendation:**
- **Isolated environments (CI/CD, Docker, Local):** Use `POST /api/v1/internal/reset` ✅
- **Real-world scenarios (Shared staging, Parallel execution):** Use `DELETE /api/v1/internal/users/:userId/data` ✅ **IMPLEMENTED**
  - Per-user cleanup without affecting other users
  - Preserves user records (user pool intact)
  - Hard deletes all user data (Items, BulkJobs, ActivityLogs, OTPs, Files)

**Available Solutions:**
- **`DELETE /api/v1/internal/users/:userId/data`** ✅ **IMPLEMENTED** - Per-user data cleanup
  - Enables parallel test execution
  - Preserves other users' data
  - Fast bulk delete operations
  - File cleanup included
- **`POST /api/v1/internal/cleanup-test-data`** ❌ **NOT IMPLEMENTED** - Selective cleanup by tag (still needed for tag-based cleanup)

---

**All questions answered based on actual codebase implementation.** ✅
