# Internal / Automation Endpoints
## Complete Request/Response Schemas

**Base Path:** `/api/v1/internal`  
**Source:** Extracted from `flowhub-core/backend/src/controllers/internalController.js`  
**Last Updated:** 2025-01-05

**⚠️ WARNING:** These endpoints are for automation/testing only. Require `x-internal-key` header.

---

## POST /api/v1/internal/reset

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Wipe all data for clean test run

### Request Headers

```
x-internal-key: flowhub-secret-automation-key-2025
```

**Note:** Default key can be overridden via `INTERNAL_AUTOMATION_KEY` environment variable

### Request

None

### Response (200)

```json
{
  "status": "success",
  "data": {
    "message": "Database wiped successfully"
  }
}
```

### Collections Wiped

- Users
- Items
- OTP
- BulkJob
- ActivityLog

### Error Responses

- **401:** Invalid or missing `x-internal-key` header

### Allowed in Automation

✅ Yes (with proper key)

---

## POST /api/v1/internal/seed

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Bulk seed items for scale testing

### Request Headers

```
x-internal-key: flowhub-secret-automation-key-2025
```

### Request Body

```json
{
  "userId": "string (required, ObjectId)",
  "count": 50
}
```

### Response (201)

```json
{
  "status": "success",
  "data": {
    "message": "Successfully seeded 50 items",
    "count": 50
  }
}
```

### Seed Data Details

- **Item Type:** DIGITAL
- **Categories:** Electronics, Home, Books, Fashion (rotated)
- **Naming:** `Auto Item {timestamp} {index}`
- **Description:** `Automated test item {index} for scale testing.`
- **Download URL:** `https://example.com/test`
- **File Size:** 1024
- **Price:** 10 + index

### Error Responses

- **400:** Missing `userId` in request body
- **401:** Invalid or missing `x-internal-key` header
- **404:** User not found

### Allowed in Automation

✅ Yes (with proper key)

---

## GET /api/v1/internal/otp

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Retrieve latest OTP for email (for automation testing)

### Request Headers

```
x-internal-key: flowhub-secret-automation-key-2025
```

### Query Parameters

- `email` (String, required)

### Response (200)

```json
{
  "status": "success",
  "data": {
    "email": "user@example.com",
    "otp": "123456",
    "type": "signup | password-reset",
    "expiresAt": "2024-12-17T10:40:00Z"
  }
}
```

### Error Responses

- **400:** Missing `email` query parameter
- **401:** Invalid or missing `x-internal-key` header
- **404:** No active OTP found for email

### Allowed in Automation

✅ Yes (with proper key)

---

## DELETE /api/v1/internal/users/:userId/data

**Auth:** No (requires `x-internal-key` header)  
**Purpose:** Hard delete all data for a specific user while preserving the user record

### Request Headers

```
x-internal-key: flowhub-secret-automation-key-2025
```

**Note:** Default key can be overridden via `INTERNAL_AUTOMATION_KEY` environment variable

### Path Parameters

- `userId` (String, required) - User ID (ObjectId format)

### Query Parameters (Optional)

- `include_otp` (boolean, default: `true`) - Whether to delete OTPs for the user
- `include_activity_logs` (boolean, default: `true`) - Whether to delete activity logs for the user

### Request Example

```http
DELETE /api/v1/internal/users/507f1f77bcf86cd799439011/data?include_otp=true&include_activity_logs=true
x-internal-key: flowhub-secret-automation-key-2025
```

### Response (200)

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

### What Gets Deleted (Hard Delete)

- ✅ **Items** - All items where `created_by = userId`
- ✅ **BulkJobs** - All bulk jobs where `userId = userId`
- ✅ **ActivityLogs** - All activity logs where `userId = userId` (if `include_activity_logs=true`)
- ✅ **OTPs** - All OTPs where `email = user.email` (if `include_otp=true`)
- ✅ **Files** - Physical files associated with deleted items (from filesystem)

### What Gets Preserved

- ✅ **User Record** - User account remains intact in database
- ✅ **Other Users' Data** - Only deletes data for the specified user

### Error Responses

- **400:** Invalid `userId` format (not a valid ObjectId)
- **401:** Invalid or missing `x-internal-key` header
- **404:** User not found

### Use Cases

- **Test Data Cleanup:** Remove all test data for a specific user after test completion
- **Parallel Test Execution:** Clean up one user's data without affecting others
- **Shared Staging Environments:** Selective cleanup without full database reset
- **User Data Migration:** Clean up old data before user migration

### Implementation Details

- Uses MongoDB transactions when supported (graceful fallback for test environments)
- Deletes files from filesystem (only counts files that actually existed)
- Atomic operation (all-or-nothing deletion)
- Fast bulk delete operations

### Example Usage

```javascript
// Delete all data for a user (including OTPs and activity logs)
const response = await fetch('/api/v1/internal/users/507f1f77bcf86cd799439011/data', {
  method: 'DELETE',
  headers: {
    'x-internal-key': 'flowhub-secret-automation-key-2025'
  }
});

// Delete user data but preserve OTPs and activity logs
const response = await fetch('/api/v1/internal/users/507f1f77bcf86cd799439011/data?include_otp=false&include_activity_logs=false', {
  method: 'DELETE',
  headers: {
    'x-internal-key': 'flowhub-secret-automation-key-2025'
  }
});
```

### Allowed in Automation

✅ Yes (with proper key)

---

## Health Check

### GET /health

**Auth:** No  
**Purpose:** Health check endpoint

### Request

None

### Response (200)

```json
{
  "status": "ok",
  "message": "FlowHub Backend is running",
  "timestamp": "2024-12-17T10:30:00Z"
}
```

---

**End of Internal/Automation Endpoints**
