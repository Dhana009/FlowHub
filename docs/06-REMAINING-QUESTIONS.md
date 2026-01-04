# Remaining Questions - System Discovery Closure
## Answers to Framework Design Questions

**Version:** 1.0  
**Last Updated:** 2024-12-17  
**Source:** Extracted directly from codebase (`flowhub-core/`)

This document answers the 6 remaining questions that impact framework design decisions.

---

## 1. Access-Token Refresh Race Conditions

### Question
When multiple parallel UI contexts use the same user:
- Can two `/auth/refresh` calls race and invalidate each other?
- Is refresh token rotation enabled or not?

### Answer

**Refresh Token Rotation:** ❌ **NOT ENABLED**

**Evidence:**
- `authService.refreshAccessToken()` (line 360-396):
  - Verifies refresh token
  - Checks user is active
  - Generates **NEW access token**
  - **Does NOT generate new refresh token** - reuses same one
  - No database state is updated during refresh

**Race Condition Risk:** ✅ **NONE**

**Why:**
- Refresh token is stateless (JWT)
- No database writes during refresh
- Multiple parallel refresh calls will all succeed
- All will receive new access tokens
- Same refresh token remains valid for all contexts

**Impact on Framework:**
- ✅ **Safe for parallel user leasing**
- ✅ **No need for refresh token locking**
- ✅ **Multiple browser contexts can share same user safely**
- ⚠️ **Note:** If refresh token is compromised, it remains valid until expiry (7-30 days)

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/authService.js:360-396
async function refreshAccessToken(refreshToken) {
  // ... verify token ...
  // ... check user active ...
  const token = generateJWT(user._id.toString(), user.email, user.role);
  // NO new refresh token generated - same one reused
  return { token, user: userObj };
}
```

---

## 2. Bulk Operations Completion Guarantees

### Question
For `/api/v1/bulk-operations`:
- Is there a terminal status list? (e.g., COMPLETED, FAILED)
- Any max polling duration recommended?

### Answer

**Terminal Status:** ✅ **`'completed'`**

**Status Enum:**
```javascript
// flowhub-core/backend/src/models/BulkJob.js:47-52
status: {
  type: String,
  required: true,
  enum: ['pending', 'processing', 'completed'],
  default: 'pending',
  index: true
}
```

**Terminal States:**
- ✅ **`'completed'`** - Job finished (all items processed, skipped, or failed)
- ❌ **No `'failed'` status** - Jobs don't fail at job level, only individual items can fail

**Max Polling Duration:** ⏱️ **24 hours**

**Evidence:**
```javascript
// flowhub-core/backend/src/models/BulkJob.js:62-65
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours TTL
  index: { expireAfterSeconds: 0 }
}
```

**Completion Detection:**
- Job is complete when: `processedIds.length + failedItems.length + skippedIds.length >= totalItems`
- Progress auto-calculated: `Math.round((totalDone / totalItems) * 100)`
- Status auto-updated to `'completed'` when all items accounted for

**Impact on Framework:**
- ✅ **Poll until `status === 'completed'`**
- ✅ **Max polling: 24 hours (job expires)**
- ✅ **No need to check for `'failed'` status**
- ✅ **Individual item failures tracked in `failedItems` array**

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/bulkService.js:115-128
if (doneCount >= job.totalItems) {
  const completedJob = await BulkJob.findOneAndUpdate(
    { _id: jobId, status: { $ne: 'completed' } },
    { $set: { status: 'completed', progress: 100 } }
  );
  return completedJob;
}
```

---

## 3. Internal Reset vs DB Reset Preference

### Question
Both are allowed:
- Is `/api/v1/internal/reset` the preferred mechanism in CI?
- Or DB reset scripts are equally acceptable?

### Answer

**Preferred Mechanism:** ✅ **`/api/v1/internal/reset` (API endpoint)**

**Why:**
- ✅ **Consistent with automation framework approach** (API-based, not DB scripts)
- ✅ **Protected by `x-internal-key` header** (secure)
- ✅ **Works across environments** (no need for DB access)
- ✅ **Atomic operation** (all collections reset in one call)
- ✅ **Returns success/failure status** (deterministic)

**What It Does:**
```javascript
// flowhub-core/backend/src/services/internalService.js:18-29
async function resetDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    OTP.deleteMany({}),
    BulkJob.deleteMany({}),
    ActivityLog.deleteMany({})
  ]);
  return { message: 'Database wiped successfully' };
}
```

**Collections Reset:**
- ✅ Users
- ✅ Items
- ✅ OTPs
- ✅ BulkJobs
- ✅ ActivityLogs

**Impact on Framework:**
- ✅ **Use `/api/v1/internal/reset` as default**
- ✅ **Requires `x-internal-key` header** (set in framework config)
- ✅ **No need for direct MongoDB access**
- ✅ **Works in CI/CD pipelines**

**Code Reference:**
```javascript
// flowhub-core/backend/src/controllers/internalController.js:13-24
function authorizeInternal(req, res) {
  const providedKey = req.headers['x-internal-key'];
  const secretKey = process.env.INTERNAL_AUTOMATION_KEY || 'flowhub-secret-automation-key-2025';
  if (!providedKey || providedKey !== secretKey) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return false;
  }
  return true;
}
```

---

## 4. Soft-Deleted Items Visibility

### Question
Currently:
- `GET /items/:id` returns inactive items
- `GET /items` filters by status

**Question:**
- Should VIEWER see inactive items via direct URL?
- Or is that acceptable by design?

### Answer

**Design Decision:** ✅ **VIEWER CAN see inactive items via direct URL (by design)**

**Evidence:**
```javascript
// flowhub-core/backend/src/controllers/itemController.js:449-452
// Get item from service (no user filtering - any authenticated user can view)
// Include inactive items so View button works for deleted items
// Pass role to allow Admin to bypass any hidden filters
const item = await itemService.getItemById(itemId, null, true, req.user?.role);
```

**Service Implementation:**
```javascript
// flowhub-core/backend/src/services/itemService.js:117-131
async function getItemById(itemId, userId = null, includeInactive = false, role = null) {
  const query = { _id: itemId };
  
  // Only filter by is_active if we don't want to include inactive items
  if (!includeInactive) {
    query.is_active = true;
  }
  
  // ADMIN and VIEWER can see all items (VIEWER is read-only)
  // Only EDITOR is restricted to their own items
  if (userId && role !== 'ADMIN' && role !== 'VIEWER') {
    query.created_by = userId;
  }
  return await Item.findOne(query);
}
```

**Behavior:**
- ✅ **`GET /items/:id`** - Includes inactive items (`includeInactive = true`)
- ✅ **`GET /items`** - Filters by `status` query param (default: active only)
- ✅ **VIEWER can access inactive items via direct URL**
- ✅ **This is intentional** - allows "View" button to work for deleted items

**Impact on Framework:**
- ✅ **Negative test case:** VIEWER accessing inactive item returns 200 (not 404)
- ✅ **Positive test case:** VIEWER accessing active item returns 200
- ✅ **List vs Detail difference:** List filters, detail includes all

**Code Reference:**
```javascript
// flowhub-core/backend/src/controllers/itemController.js:450-452
// Include inactive items so View button works for deleted items
const item = await itemService.getItemById(itemId, null, true, req.user?.role);
```

---

## 5. Iframe Instability Expectations

### Question
Given known iframe blockers:
- Are iframe load failures considered "expected behavior" in prod?
- Or should tests retry once before failing?

### Answer

**Iframe Failure Handling:** ⚠️ **NO RETRY LOGIC (permanent failure)**

**Evidence:**
```javascript
// flowhub-core/frontend/src/components/items/ItemDetailsModal.jsx:85-86
const IFRAME_TIMEOUT_MS = 5000; // 5 seconds

// flowhub-core/frontend/src/components/items/ItemDetailsModal.jsx:326-330
const handleIframeError = useCallback(() => {
  clearIframeTimeout();
  setIframeError(true); // Sets error state - NO retry
}, [clearIframeTimeout]);
```

**Behavior:**
- ⏱️ **5 second timeout** - iframe must load within 5 seconds
- ❌ **No retry** - iframe errors are permanent (unlike item loading which has 3 retries)
- ✅ **Error state displayed** - user sees error message
- ✅ **Timeout triggers error** - if iframe doesn't load in 5s, error is shown

**Item Loading vs Iframe Loading:**
- **Item loading:** Has retry logic (MAX_RETRIES = 3)
- **Iframe loading:** No retry logic (permanent failure)

**Impact on Framework:**
- ⚠️ **Iframe failures are expected** (X-Frame-Options, CORS, network issues)
- ✅ **Tests should NOT retry iframe failures**
- ✅ **Tests should verify error state is displayed**
- ✅ **Iframe failures are NOT test failures** - they're product behavior

**Test Strategy:**
```python
# Framework should handle iframe failures gracefully
# 1. Wait for iframe timeout (5 seconds)
# 2. Verify error state is displayed
# 3. Do NOT retry iframe loading
# 4. Iframe failure is acceptable behavior
```

**Code Reference:**
```javascript
// flowhub-core/frontend/src/components/items/ItemDetailsModal.jsx:469-477
useEffect(() => {
  if (item?.embed_url && isValidEmbedUrl(item.embed_url) && !iframeLoaded && !iframeError) {
    iframeTimeoutRef.current = setTimeout(() => {
      handleIframeError(); // Sets error - no retry
    }, IFRAME_TIMEOUT_MS);
    return () => clearIframeTimeout();
  }
}, [item?.embed_url, iframeLoaded, iframeError, isValidEmbedUrl, handleIframeError, clearIframeTimeout]);
```

---

## 6. User Deactivation Edge Case

### Question
If a user is deactivated mid-session:
- Does `/auth/refresh` fail immediately?
- Or only after access token expiry?

### Answer

**Deactivation Enforcement:** ✅ **IMMEDIATE (checked on every refresh)**

**Evidence:**
```javascript
// flowhub-core/backend/src/services/authService.js:378-383
// Check if user is active (Security Guardrail)
if (user.isActive === false) {
  const error = new Error('Account deactivated');
  error.statusCode = 401;
  throw error;
}
```

**Behavior:**
- ✅ **Checked on every `/auth/refresh` call** - not just on access token expiry
- ✅ **Returns 401 immediately** - user cannot refresh tokens
- ✅ **Access token remains valid** - until it expires naturally (15 minutes)
- ✅ **Refresh token becomes useless** - cannot get new access tokens

**Timeline Example:**
1. User logged in at 10:00 AM (access token expires 10:15 AM)
2. User deactivated at 10:05 AM
3. User tries to refresh at 10:06 AM → **401 (immediate failure)**
4. User's existing access token still works until 10:15 AM
5. After 10:15 AM, user cannot get new tokens (refresh fails)

**Impact on Framework:**
- ✅ **Deactivation is enforced immediately on refresh**
- ✅ **Existing access tokens remain valid until expiry**
- ✅ **Tests should verify refresh fails immediately after deactivation**
- ✅ **Tests should verify access token still works until expiry**

**Code Reference:**
```javascript
// flowhub-core/backend/src/services/authService.js:360-396
async function refreshAccessToken(refreshToken) {
  // ... verify token ...
  const user = await User.findById(decoded.sub);
  // ... check user exists ...
  
  // Check if user is active (Security Guardrail)
  if (user.isActive === false) {
    const error = new Error('Account deactivated');
    error.statusCode = 401;
    throw error; // Immediate failure
  }
  
  // Generate new access token
  const token = generateJWT(user._id.toString(), user.email, user.role);
  return { token, user: userObj };
}
```

---

## Summary Table

| Question | Answer | Impact |
|----------|--------|--------|
| **1. Refresh Token Race Conditions** | No rotation, no race risk | ✅ Safe for parallel user leasing |
| **2. Bulk Operations Completion** | Terminal: `'completed'`, Max: 24h | ✅ Poll until completed, 24h timeout |
| **3. Internal Reset Preference** | API endpoint preferred | ✅ Use `/api/v1/internal/reset` |
| **4. Soft-Deleted Items Visibility** | VIEWER can see inactive items | ✅ Negative test: 200 OK (not 404) |
| **5. Iframe Instability** | No retry, permanent failure | ✅ Don't retry, verify error state |
| **6. User Deactivation** | Immediate on refresh | ✅ Refresh fails immediately |

---

## Framework Design Decisions

Based on these answers:

1. **Auth Reuse Strategy:**
   - ✅ Multiple contexts can share same user (no refresh token locking needed)
   - ✅ Refresh token rotation not required

2. **Bulk Operations Polling:**
   - ✅ Poll until `status === 'completed'`
   - ✅ Max duration: 24 hours
   - ✅ No need to handle `'failed'` status

3. **Test Data Reset:**
   - ✅ Use `/api/v1/internal/reset` (not DB scripts)
   - ✅ Requires `x-internal-key` header

4. **Negative Test Cases:**
   - ✅ VIEWER accessing inactive item → 200 OK (expected)
   - ✅ Iframe failures → Error state (expected, no retry)

5. **Auth Lifecycle:**
   - ✅ Deactivation enforced immediately on refresh
   - ✅ Existing access tokens valid until expiry

---

**End of Remaining Questions**
