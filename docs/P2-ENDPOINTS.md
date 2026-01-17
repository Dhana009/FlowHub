# P2 Endpoints - Supporting/Automation
## API Automation Testing Reference

**Priority:** P2 (Supporting - Nice to Have)  
**Last Updated:** 2025-01-05  
**Purpose:** Internal/automation endpoints for test data management

---

## Quick Reference

| Endpoint | Method | Purpose | Auth | Internal Key |
|----------|--------|---------|------|--------------|
| `/api/v1/internal/reset` | POST | Reset entire database | No | Required |
| `/api/v1/internal/seed` | POST | Seed test data | No | Required |
| `/api/v1/internal/otp` | GET | Get OTP for automation | No | Required |
| `/api/v1/internal/users/:userId/data` | DELETE | Hard delete all user data | No | Required |
| `/api/v1/internal/users/:userId/items` | DELETE | Hard delete user items only | No | Required |
| `/api/v1/internal/items/:id/permanent` | DELETE | Hard delete single item | No | Required |
| `/api/v1/items/seed-status/:userId` | GET | Get seed data status | Yes | No |
| `/health` | GET | Health check | No | No |

---

## POST /api/v1/internal/reset

**Purpose:** Wipe all data for clean test run

### Request

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Note:** Default key can be overridden via `INTERNAL_AUTOMATION_KEY` environment variable

### Response Schema (200)

```json
{
  "status": "success",
  "data": {
    "message": "string (Database wiped successfully)"
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

| Status | Error Code | Message |
|--------|------------|---------|
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Valid reset | Valid internal key | 200, database wiped |
| Reset empty database | Reset when no data exists | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing internal key | No x-internal-key header | 401, "Unauthorized: Invalid or missing Internal Safety Key" |
| Invalid internal key | Wrong key value | 401, "Unauthorized: Invalid or missing Internal Safety Key" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Multiple reset calls | Reset multiple times | 200, success each time |

---

## POST /api/v1/internal/seed

**Purpose:** Bulk seed items for scale testing

### Request Schema

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Body:**
```json
{
  "userId": "string (required, ObjectId format)",
  "count": "number (required, number of items to create)"
}
```

### Response Schema (201)

```json
{
  "status": "success",
  "data": {
    "message": "string (Successfully seeded X items)",
    "count": "number (number of items created)"
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

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "userId is required" |
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |
| 404 | 404 | "User not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Seed 10 items | `{userId: "...", count: 10}` | 201, 10 items created |
| Seed 50 items | `{userId: "...", count: 50}` | 201, 50 items created |
| Seed 100 items | `{userId: "...", count: 100}` | 201, 100 items created |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing userId | `{count: 10}` | 400, "userId is required" |
| Missing count | `{userId: "..."}` | 400, validation error |
| Invalid userId format | `{userId: "invalid", count: 10}` | 404, "User not found" |
| Non-existent user | `{userId: "507f1f77bcf86cd799439999", count: 10}` | 404, "User not found" |
| Missing internal key | No x-internal-key header | 401, "Unauthorized" |
| Invalid internal key | Wrong key value | 401, "Unauthorized" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Seed 0 items | `{userId: "...", count: 0}` | 201, 0 items created |
| Seed 1 item | `{userId: "...", count: 1}` | 201, 1 item created |
| Large seed (1000) | `{userId: "...", count: 1000}` | 201, 1000 items created |

---

## GET /api/v1/internal/otp

**Purpose:** Retrieve latest OTP for email (for automation testing)

### Request

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Query Parameters:**
- `email` (string, required) - Email address

### Response Schema (200)

```json
{
  "status": "success",
  "data": {
    "email": "string",
    "otp": "string (6 digits)",
    "type": "string (enum: signup | password-reset)",
    "expiresAt": "string (ISO 8601 date)"
  }
}
```

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Email query param is required" |
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |
| 404 | 404 | "No active OTP found for email" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Get signup OTP | `?email=user@example.com` (signup OTP exists) | 200, OTP data with type: "signup" |
| Get password reset OTP | `?email=user@example.com` (password-reset OTP exists) | 200, OTP data with type: "password-reset" |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Missing email | No query param | 400, "Email query param is required" |
| No OTP found | `?email=nonexistent@example.com` | 404, "No active OTP found for email" |
| Expired OTP | OTP exists but expired | 404, "No active OTP found for email" |
| Missing internal key | No x-internal-key header | 401, "Unauthorized" |
| Invalid internal key | Wrong key value | 401, "Unauthorized" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Multiple OTPs for email | Multiple OTPs exist | 200, returns latest OTP |
| OTP just expired | OTP expired 1 second ago | 404, "No active OTP found for email" |

---

## DELETE /api/v1/internal/users/:userId/data

**Purpose:** Hard delete all data for a specific user while preserving user record

### Request

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Path Parameters:**
- `userId` (string, required) - User ID (ObjectId format, 24 hex chars)

**Query Parameters (Optional):**
- `include_otp` (boolean, default: `true`) - Whether to delete OTPs
- `include_activity_logs` (boolean, default: `true`) - Whether to delete activity logs

### Response Schema (200)

```json
{
  "status": "success",
  "deleted": {
    "items": "number (count of deleted items)",
    "files": "number (count of deleted files)",
    "bulk_jobs": "number (count of deleted bulk jobs)",
    "activity_logs": "number (count of deleted activity logs)",
    "otps": "number (count of deleted OTPs)"
  },
  "preserved": {
    "user": "boolean (true - user record preserved)"
  }
}
```

### What Gets Deleted (Hard Delete)

- Items: All items where `created_by = userId`
- BulkJobs: All bulk jobs where `userId = userId`
- ActivityLogs: All activity logs where `userId = userId` (if `include_activity_logs=true`)
- OTPs: All OTPs where `email = user.email` (if `include_otp=true`)
- Files: Physical files associated with deleted items (from filesystem)

### What Gets Preserved

- User Record: User account remains intact
- Other Users' Data: Only deletes data for specified user

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid user ID format. Expected 24-character hexadecimal string." |
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |
| 404 | 404 | "User not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete all user data | Valid userId, default params | 200, all data deleted, user preserved |
| Delete without OTPs | `?include_otp=false` | 200, OTPs preserved, other data deleted |
| Delete without activity logs | `?include_activity_logs=false` | 200, activity logs preserved, other data deleted |
| Delete with both flags false | `?include_otp=false&include_activity_logs=false` | 200, OTPs and logs preserved |
| User with no data | Valid userId, no items/data | 200, all counts: 0 |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid userId format | `DELETE /api/v1/internal/users/invalid/data` | 400, "Invalid user ID format" |
| Non-existent user | Valid format, non-existent ID | 404, "User not found" |
| Missing internal key | No x-internal-key header | 401, "Unauthorized" |
| Invalid internal key | Wrong key value | 401, "Unauthorized" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| User with many items (1000+) | Large dataset | 200, all deleted successfully |
| User with files | Items with file_path | 200, files deleted from filesystem |
| Missing files | Items with file_path but file doesn't exist | 200, files_deleted: 0 (graceful) |

---

## DELETE /api/v1/internal/users/:userId/items

**Purpose:** Hard delete only items for a specific user (preserves BulkJobs, ActivityLogs, OTPs)

### Request

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Path Parameters:**
- `userId` (string, required) - User ID (ObjectId format)

### Response Schema (200)

```json
{
  "status": "success",
  "deleted": {
    "items": "number (count of deleted items)",
    "files": "number (count of deleted files)"
  },
  "preserved": {
    "user": "boolean (true)",
    "bulk_jobs": "boolean (true)",
    "activity_logs": "boolean (true)",
    "otps": "boolean (true)"
  }
}
```

### What Gets Deleted

- Items: All items where `created_by = userId`
- Files: Physical files associated with deleted items

### What Gets Preserved

- User Record
- BulkJobs
- ActivityLogs
- OTPs

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid user ID format" |
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |
| 404 | 404 | "User not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete user items | Valid userId | 200, items deleted, other data preserved |
| User with no items | Valid userId, no items | 200, items: 0, other data preserved |
| User with files | Items with file_path | 200, files deleted |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid userId format | `DELETE /api/v1/internal/users/invalid/items` | 400, "Invalid user ID format" |
| Non-existent user | Valid format, non-existent ID | 404, "User not found" |
| Missing internal key | No x-internal-key header | 401, "Unauthorized" |
| Invalid internal key | Wrong key value | 401, "Unauthorized" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| User with many items | 1000+ items | 200, all deleted successfully |
| Missing files | Items with file_path but file doesn't exist | 200, files_deleted: 0 |

---

## DELETE /api/v1/internal/items/:id/permanent

**Purpose:** Hard delete a single item by ID (removes from MongoDB)

### Request

**Headers:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Path Parameters:**
- `id` (string, required) - Item ID (ObjectId format)

### Response Schema (200)

```json
{
  "status": "success",
  "message": "string (Item permanently deleted)",
  "deleted": {
    "item_deleted": "boolean (true)",
    "files_deleted": "number (0 or 1)"
  }
}
```

### What Gets Deleted

- Item: Permanently removed from MongoDB
- File: Associated file from filesystem (if `file_path` exists)

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid item ID format. Expected 24-character hexadecimal string." |
| 401 | 401 | "Unauthorized: Invalid or missing Internal Safety Key" |
| 404 | 404 | "Item not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete item | Valid item ID | 200, item_deleted: true |
| Delete item with file | Item has file_path | 200, item_deleted: true, files_deleted: 1 |
| Delete item without file | Item has no file_path | 200, item_deleted: true, files_deleted: 0 |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid ID format | `DELETE /api/v1/internal/items/invalid/permanent` | 400, "Invalid item ID format" |
| Non-existent item | Valid format, non-existent ID | 404, "Item not found" |
| Missing internal key | No x-internal-key header | 401, "Unauthorized" |
| Invalid internal key | Wrong key value | 401, "Unauthorized" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Delete soft-deleted item | Item is soft-deleted | 200, permanently deleted |
| Missing file | Item has file_path but file doesn't exist | 200, files_deleted: 0 |
| Race condition | Item deleted between find and delete | 404, "Item not found" |

---

## GET /api/v1/items/seed-status/:userId

**Purpose:** Get seed data status for a user

### Request

**Path Parameter:**
- `userId` (string, required) - User ID (ObjectId format)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters (Optional):**
- `seed_version` (string, optional) - Seed version to check

### Response Schema (200)

```json
{
  "status": "success",
  "seed_complete": "boolean",
  "total_expected": "number",
  "total_found": "number",
  "missing_items": "array<object> (if seed_complete=false)",
  "seed_version": "string"
}
```

### Business Rules

**RBAC:**
- ADMIN: Can check any user's seed status
- VIEWER: Can check any user's seed status
- EDITOR: Can only check own seed status (`userId` must match authenticated user)

### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | 400 | "Invalid user ID format" |
| 401 | 401 | "Authentication required" |
| 403 | 403 | "Insufficient permissions" (EDITOR checking other user) |
| 404 | 404 | "User not found" |

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Check seed status | Valid userId | 200, seed_complete: true/false |
| Seed complete | All seed items exist | 200, seed_complete: true, missing_items: [] |
| Seed incomplete | Some items missing | 200, seed_complete: false, missing_items: [...] |
| ADMIN checks any user | ADMIN token, any userId | 200, success |
| EDITOR checks own | EDITOR token, own userId | 200, success |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid userId format | `GET /api/v1/items/seed-status/invalid` | 400, "Invalid user ID format" |
| Non-existent user | Valid format, non-existent ID | 404, "User not found" |
| No authentication | No Authorization header | 401, "Authentication required" |
| EDITOR other user | EDITOR token, other user's ID | 403, "Insufficient permissions" |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| User with no items | User exists but no items | 200, seed_complete: false, total_found: 0 |
| Check with seed_version | `?seed_version=v1.0` | 200, checks specific version |

---

## GET /health

**Purpose:** Health check endpoint

### Request

None

### Response Schema (200)

```json
{
  "status": "string (ok)",
  "message": "string (FlowHub Backend is running)",
  "timestamp": "string (ISO 8601 date)"
}
```

### Error Responses

None (always returns 200 if server is running)

### Test Cases

#### Positive Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Health check | `GET /health` | 200, status: "ok" |

#### Negative Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| N/A | Server down | Connection error (not 200) |

#### Edge Cases

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Multiple health checks | Call multiple times | 200, success each time |

---

## Internal Key Authentication

**Header:**
```
x-internal-key: flowhub-secret-automation-key-2025
```

**Environment Variable:**
- `INTERNAL_AUTOMATION_KEY` (optional, overrides default)

**Security:**
- Required for all `/api/v1/internal/*` endpoints
- Not required for `/health` endpoint
- Not required for `/api/v1/items/seed-status/:userId` (uses Bearer token)

---

## Global Error Response Format

All error responses follow this structure:

```json
{
  "status": "error",
  "error_code": 400 | 401 | 404 | 500,
  "error_type": "Error Type String",
  "message": "Human-readable error message",
  "timestamp": "2024-12-17T10:30:00Z",
  "path": "/api/v1/internal/reset"
}
```

---

**End of P2 Endpoints**
