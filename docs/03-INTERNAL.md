# Internal / Automation Endpoints
## Complete Request/Response Schemas

**Base Path:** `/api/v1/internal`  
**Source:** Extracted from `flowhub-core/backend/src/controllers/internalController.js`

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
